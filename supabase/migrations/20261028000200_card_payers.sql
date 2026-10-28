-- Which checking/savings accounts pay each credit card.
-- A card has at most one default payer (covers every category without a
-- rule) and any number of payers that cover specific categories.

create table public.card_payers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id uuid not null,
  payer_account_id uuid not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),

  unique (id, card_id, user_id),
  unique (card_id, payer_account_id),
  foreign key (card_id, user_id) references public.accounts (id, user_id) on delete cascade,
  foreign key (payer_account_id, user_id) references public.accounts (id, user_id) on delete cascade
);

create unique index card_payers_one_default_key on public.card_payers (card_id) where is_default;
create index card_payers_payer_account_idx on public.card_payers (payer_account_id);

-- A category has at most one payer per card.
create table public.card_payer_categories (
  card_id uuid not null,
  card_payer_id uuid not null,
  category_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  primary key (card_id, category_id),
  foreign key (card_payer_id, card_id, user_id)
    references public.card_payers (id, card_id, user_id) on delete cascade,
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade
);

create index card_payer_categories_payer_idx on public.card_payer_categories (card_payer_id);
create index card_payer_categories_category_idx on public.card_payer_categories (category_id);

-- Cards are paid by checking or savings accounts, never by another card.
create function private.validate_card_payer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.accounts where id = new.card_id and type = 'credit_card') then
    raise exception 'Only credit cards have payers.' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from public.accounts where id = new.payer_account_id and type <> 'credit_card') then
    raise exception 'A card must be paid from a checking or savings account.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger card_payers_validate
  before insert or update on public.card_payers
  for each row execute function private.validate_card_payer();

alter table public.card_payers enable row level security;
alter table public.card_payer_categories enable row level security;

create policy "Users manage their card payers"
  on public.card_payers for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their card payer categories"
  on public.card_payer_categories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.card_payers to authenticated;
grant select, insert, update, delete on public.card_payer_categories to authenticated;

-- Replaces a card's whole payer setup in one step.
--   default_payer_id: account that pays everything else (null = none)
--   rules: [{"payer_account_id": "...", "category_ids": ["...", ...]}, ...]
create function public.save_card_payers(card_id uuid, default_payer_id uuid default null, rules jsonb default '[]')
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

revoke execute on function public.save_card_payers from public, anon;
grant execute on function public.save_card_payers to authenticated;
