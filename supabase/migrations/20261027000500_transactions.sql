create type public.transaction_kind as enum ('regular', 'transfer', 'payment');
create type public.transaction_source as enum ('app', 'shortcut');

-- One row per transfer (checking/savings ↔ checking/savings) or payment
-- (checking/savings → credit card). Its two transaction rows are written by
-- public.create_transfer and deleted with it.
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind public.transaction_kind not null check (kind <> 'regular'),
  from_account_id uuid not null,
  to_account_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  date date not null default current_date,
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now(),

  unique (id, user_id),
  foreign key (from_account_id, user_id) references public.accounts (id, user_id) on delete restrict,
  foreign key (to_account_id, user_id) references public.accounts (id, user_id) on delete restrict,
  constraint different_accounts check (from_account_id <> to_account_id)
);

create index transfers_from_account_idx on public.transfers (from_account_id);
create index transfers_to_account_idx on public.transfers (to_account_id);

-- Sign rules:
--   credit card:        + charge, − payment or refund
--   checking / savings: + deposit, − withdrawal
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null,
  amount_cents bigint not null check (amount_cents <> 0),
  date date not null default current_date,
  description text check (char_length(description) <= 200),
  merchant text check (char_length(merchant) <= 100),
  category_id uuid,
  kind public.transaction_kind not null default 'regular',
  transfer_id uuid,
  source public.transaction_source not null default 'app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (account_id, user_id) references public.accounts (id, user_id) on delete restrict,
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict,
  foreign key (transfer_id, user_id) references public.transfers (id, user_id) on delete cascade,
  constraint transfer_link check ((kind = 'regular') = (transfer_id is null)),
  constraint no_category_on_transfers check (kind = 'regular' or category_id is null)
);

create index transactions_account_date_idx on public.transactions (account_id, date desc);
create index transactions_user_date_idx on public.transactions (user_id, date desc, created_at desc);
create index transactions_category_idx on public.transactions (category_id);
create index transactions_transfer_idx on public.transactions (transfer_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function private.set_updated_at();

-- Regular credit card transactions need a category; deposits and
-- withdrawals may leave it empty.
create function private.require_card_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.kind = 'regular' and new.category_id is null and exists (
    select 1 from public.accounts where id = new.account_id and type = 'credit_card'
  ) then
    raise exception 'Credit card transactions need a category.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger transactions_require_card_category
  before insert or update of account_id, category_id, kind on public.transactions
  for each row execute function private.require_card_category();

alter table public.transfers enable row level security;
alter table public.transactions enable row level security;

create policy "Users read their transfers"
  on public.transfers for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users delete their transfers"
  on public.transfers for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read their transactions"
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

-- Transfer and payment rows are only written by public.create_transfer.
create policy "Users add regular transactions"
  on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id and kind = 'regular' and transfer_id is null);

create policy "Users edit regular transactions"
  on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id and kind = 'regular')
  with check ((select auth.uid()) = user_id and kind = 'regular' and transfer_id is null);

create policy "Users delete regular transactions"
  on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id and kind = 'regular');

grant select, delete on public.transfers to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

-- Creates a transfer or a payment and both of its transaction rows.
-- The kind follows from the destination account:
--   checking/savings → checking/savings: transfer, −X from and +X to
--   checking/savings → credit card:      payment,  −X on both sides
create function public.create_transfer(
  from_account_id uuid,
  to_account_id uuid,
  amount_cents bigint,
  on_date date default current_date,
  note text default null,
  source public.transaction_source default 'app'
)
returns public.transfers
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  from_type public.account_type;
  to_type public.account_type;
  result public.transfers;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = 'insufficient_privilege';
  end if;
  if amount_cents is null or amount_cents <= 0 then
    raise exception 'Amount must be greater than zero.' using errcode = 'check_violation';
  end if;

  select type into from_type from public.accounts where id = from_account_id and user_id = uid;
  select type into to_type from public.accounts where id = to_account_id and user_id = uid;

  if from_type is null or to_type is null then
    raise exception 'Account not found.' using errcode = 'no_data_found';
  end if;
  if from_type = 'credit_card' then
    raise exception 'Transfers and payments must come from a checking or savings account.'
      using errcode = 'check_violation';
  end if;

  insert into public.transfers (user_id, kind, from_account_id, to_account_id, amount_cents, date, note)
  values (
    uid,
    case when to_type = 'credit_card' then 'payment' else 'transfer' end::public.transaction_kind,
    create_transfer.from_account_id,
    create_transfer.to_account_id,
    create_transfer.amount_cents,
    coalesce(on_date, current_date),
    create_transfer.note
  )
  returning * into result;

  insert into public.transactions (user_id, account_id, amount_cents, date, description, kind, transfer_id, source)
  values
    (uid, result.from_account_id, -result.amount_cents, result.date, result.note, result.kind, result.id, create_transfer.source),
    (uid, result.to_account_id,
      case when result.kind = 'payment' then -result.amount_cents else result.amount_cents end,
      result.date, result.note, result.kind, result.id, create_transfer.source);

  return result;
end;
$$;

revoke execute on function public.create_transfer from public, anon;
grant execute on function public.create_transfer to authenticated;
