-- Every card has an account that pays for "everything else", so no part of
-- a card's balance is ever left without a payer.

-- 1. Saving a card's payers now requires the default payer.
create or replace function public.save_card_payers(card_id uuid, default_payer_id uuid default null, rules jsonb default '[]')
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  rule jsonb;
  payer_row uuid;
  category uuid;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = 'insufficient_privilege';
  end if;
  if not exists (
    select 1 from public.accounts a
    where a.id = save_card_payers.card_id and a.user_id = uid and a.type = 'credit_card'
  ) then
    raise exception 'Card not found.' using errcode = 'no_data_found';
  end if;
  if default_payer_id is null then
    raise exception 'Choose the account that pays for everything else.' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(coalesce(rules, '[]')) <> 'array' then
    raise exception 'Rules must be a list.' using errcode = 'invalid_parameter_value';
  end if;

  delete from public.card_payers cp where cp.card_id = save_card_payers.card_id;

  if default_payer_id is not null then
    insert into public.card_payers (user_id, card_id, payer_account_id, is_default)
    values (uid, save_card_payers.card_id, default_payer_id, true);
  end if;

  for rule in select value from jsonb_array_elements(coalesce(rules, '[]')) loop
    insert into public.card_payers (user_id, card_id, payer_account_id)
    values (uid, save_card_payers.card_id, (rule ->> 'payer_account_id')::uuid)
    on conflict on constraint card_payers_card_id_payer_account_id_key do nothing;

    select cp.id into payer_row from public.card_payers cp
    where cp.card_id = save_card_payers.card_id
      and cp.payer_account_id = (rule ->> 'payer_account_id')::uuid;

    for category in
      select value::uuid from jsonb_array_elements_text(coalesce(rule -> 'category_ids', '[]'))
    loop
      begin
        insert into public.card_payer_categories (user_id, card_id, card_payer_id, category_id)
        values (uid, save_card_payers.card_id, payer_row, category);
      exception when unique_violation then
        raise exception 'A category can only have one payer per card.' using errcode = 'check_violation';
      end;
    end loop;
  end loop;
end;
$$;

-- 2. An account that pays a card can't be deleted out from under it; change
-- who pays first. (Archiving is still allowed.)
alter table public.card_payers
  drop constraint card_payers_payer_account_id_user_id_fkey,
  add constraint card_payers_payer_account_id_user_id_fkey
    foreign key (payer_account_id, user_id) references public.accounts (id, user_id) on delete restrict;

-- 3. New cards start with a default payer: the first checking account (or
-- savings if there's no checking). Cards added before any bank account get
-- one as soon as the first bank account exists. People change it in Who pays.
create function private.assign_default_payers()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.type = 'credit_card' then
    insert into public.card_payers (user_id, card_id, payer_account_id, is_default)
    select new.user_id, new.id, a.id, true
    from public.accounts a
    where a.user_id = new.user_id and a.type <> 'credit_card' and not a.archived
    order by (a.type = 'checking') desc, a.created_at
    limit 1;
  else
    insert into public.card_payers (user_id, card_id, payer_account_id, is_default)
    select new.user_id, c.id, new.id, true
    from public.accounts c
    where c.user_id = new.user_id
      and c.type = 'credit_card'
      and not exists (select 1 from public.card_payers p where p.card_id = c.id and p.is_default)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger accounts_assign_default_payers
  after insert on public.accounts
  for each row execute function private.assign_default_payers();

-- Existing cards without a default get one the same way.
insert into public.card_payers (user_id, card_id, payer_account_id, is_default)
select c.user_id, c.id, b.id, true
from public.accounts c
cross join lateral (
  select a.id from public.accounts a
  where a.user_id = c.user_id and a.type <> 'credit_card' and not a.archived
  order by (a.type = 'checking') desc, a.created_at
  limit 1
) b
where c.type = 'credit_card'
  and not exists (select 1 from public.card_payers p where p.card_id = c.id and p.is_default)
on conflict do nothing;
