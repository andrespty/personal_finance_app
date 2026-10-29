-- The checking/savings account shown big on the dashboard. Null = the app
-- picks one (first checking, else first savings). Cleared if the account is
-- deleted.
alter table public.profiles
  add column pinned_account_id uuid,
  add foreign key (pinned_account_id, user_id)
    references public.accounts (id, user_id) on delete set null (pinned_account_id);

comment on column public.profiles.pinned_account_id is
  'Checking/savings account shown on the dashboard. Null = first checking.';

-- Cards can't be pinned.
create function private.validate_pinned_account()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.pinned_account_id is not null and exists (
    select 1 from public.accounts where id = new.pinned_account_id and type = 'credit_card'
  ) then
    raise exception 'Only checking and savings accounts can be pinned.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_pinned_account
  before insert or update of pinned_account_id on public.profiles
  for each row execute function private.validate_pinned_account();

grant update (pinned_account_id) on public.profiles to authenticated;
