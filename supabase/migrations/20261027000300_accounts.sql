create type public.account_type as enum ('checking', 'savings', 'credit_card');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  alias text check (alias ~ '^[a-z0-9-]{1,30}$'),
  wallet_name text check (char_length(wallet_name) between 1 and 80),
  type public.account_type not null,
  opening_balance_cents bigint not null default 0,
  credit_limit_cents bigint check (credit_limit_cents >= 0),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Lets child tables reference (id, user_id) so rows can never point at
  -- another user's account.
  unique (id, user_id),
  -- Cards always start at 0; the user enters their transactions.
  constraint card_opening_balance_zero
    check (type <> 'credit_card' or opening_balance_cents = 0),
  constraint credit_limit_cards_only
    check (type = 'credit_card' or credit_limit_cents is null)
);

comment on column public.accounts.alias is
  'Short lowercase name for Shortcuts and voice, e.g. "vx".';
comment on column public.accounts.wallet_name is
  'Card name as Apple Wallet reports it, used by the Wallet automation.';

create unique index accounts_user_name_key on public.accounts (user_id, lower(name));
create unique index accounts_user_alias_key on public.accounts (user_id, alias) where alias is not null;
create unique index accounts_user_wallet_name_key
  on public.accounts (user_id, lower(wallet_name)) where wallet_name is not null;

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function private.set_updated_at();

-- Changing an account's type would silently flip the meaning of its
-- transactions' signs, so it is fixed at creation.
create function private.prevent_account_type_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.type <> old.type then
    raise exception 'An account''s type cannot be changed.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger accounts_prevent_type_change
  before update of type on public.accounts
  for each row execute function private.prevent_account_type_change();

alter table public.accounts enable row level security;

create policy "Users manage their accounts"
  on public.accounts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.accounts to authenticated;
