-- Functions behind the Shortcuts API (supabase/functions/api).
-- Only the Edge Function can call them: it runs as service_role, checks the
-- caller's API token with api_user_for_token, then passes that user's id.
-- They run as their owner (security definer) and scope every read and write
-- to that user themselves, so service_role needs no table access.

-- Returns the token's owner, or null if it's unknown or revoked.
create function public.api_user_for_token(token text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  update public.api_tokens
  set last_used_at = now()
  where token_hash = encode(extensions.digest(token, 'sha256'), 'hex') and revoked_at is null
  returning user_id;
$$;

-- Finds an account by id, alias, Wallet name or name (ignoring case).
create function private.api_find_account(user_ref uuid, ref text)
returns public.accounts
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  found_account public.accounts;
  needle text := lower(btrim(ref));
begin
  select * into found_account
  from public.accounts a
  where a.user_id = user_ref
    and not a.archived
    and (a.id::text = needle or a.alias = needle or lower(a.wallet_name) = needle or lower(a.name) = needle)
  order by (a.id::text = needle) desc, (a.alias = needle) desc, (lower(a.wallet_name) = needle) desc
  limit 1;

  if found_account.id is null then
    raise exception 'No account named "%".', btrim(ref) using errcode = 'no_data_found';
  end if;
  return found_account;
end;
$$;

-- Finds a category by id, "Parent/Child" path, or name (ignoring case).
create function private.api_find_category(user_ref uuid, ref text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  needle text := lower(btrim(ref));
  matches uuid[];
begin
  select array_agg(c.id) into matches
  from public.categories c
  left join public.categories p on p.id = c.parent_id
  where c.user_id = user_ref
    and (
      c.id::text = needle
      or lower(coalesce(p.name || '/', '') || c.name) = needle
      or (strpos(needle, '/') = 0 and lower(c.name) = needle)
    );

  if matches is null then
    raise exception 'No category named "%".', btrim(ref) using errcode = 'no_data_found';
  end if;
  if array_length(matches, 1) > 1 then
    raise exception 'More than one category is named "%". Use Parent/Child, like Shopping/Clothing.', btrim(ref)
      using errcode = 'check_violation';
  end if;
  return matches[1];
end;
$$;

-- Everything a Shortcut needs for its pickers.
create function public.api_info(user_ref uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'accounts', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'alias', a.alias, 'type', a.type) order by a.created_at)
      from public.accounts a
      where a.user_id = user_ref and not a.archived and a.type <> 'credit_card'
    ), '[]'::jsonb),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'alias', a.alias, 'wallet_name', a.wallet_name) order by a.created_at)
      from public.accounts a
      where a.user_id = user_ref and not a.archived and a.type = 'credit_card'
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'path', coalesce(p.name || '/', '') || c.name)
        order by coalesce(p.name, c.name), p.name is not null, c.name)
      from public.categories c
      left join public.categories p on p.id = c.parent_id
      where c.user_id = user_ref
    ), '[]'::jsonb)
  );
$$;

-- Money left for every checking/savings account.
create function public.api_money_left(user_ref uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'name', a.name,
    'alias', a.alias,
    'balance_cents', m.balance_cents,
    'covers_cents', m.covers_cents,
    'money_left_cents', m.money_left_cents
  ) order by a.created_at), '[]'::jsonb)
  from public.accounts a
  join public.account_money_left m on m.account_id = a.id
  where a.user_id = user_ref and not a.archived;
$$;

-- Adds a regular transaction. `kind` is 'card' (charge/refund) or 'bank'
-- (deposit/withdrawal); amount_cents is already signed by the caller.
create function public.api_add_transaction(
  user_ref uuid,
  kind text,
  account_ref text,
  amount_cents bigint,
  category_ref text default null,
  description text default null,
  merchant text default null,
  on_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.accounts;
  category uuid;
  created public.transactions;
begin
  target := private.api_find_account(user_ref, account_ref);
  if kind = 'card' and target.type <> 'credit_card' then
    raise exception '"%" is not a credit card.', target.name using errcode = 'check_violation';
  end if;
  if kind = 'bank' and target.type = 'credit_card' then
    raise exception '"%" is a credit card. Use card-transactions for cards.', target.name using errcode = 'check_violation';
  end if;
  if nullif(btrim(category_ref), '') is not null then
    category := private.api_find_category(user_ref, category_ref);
  end if;

  insert into public.transactions (user_id, account_id, amount_cents, date, category_id, description, merchant, source)
  values (
    user_ref, target.id, api_add_transaction.amount_cents, coalesce(on_date, current_date), category,
    nullif(btrim(api_add_transaction.description), ''), nullif(btrim(api_add_transaction.merchant), ''), 'shortcut'
  )
  returning * into created;

  return jsonb_build_object(
    'id', created.id,
    'account', target.name,
    'amount_cents', created.amount_cents,
    'date', created.date,
    'category_id', created.category_id
  );
end;
$$;

-- Moves money between two checking/savings accounts.
create function public.api_transfer(
  user_ref uuid,
  from_ref text,
  to_ref text,
  amount_cents bigint,
  on_date date default null,
  note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_account public.accounts;
  destination public.accounts;
  created public.transfers;
begin
  source_account := private.api_find_account(user_ref, from_ref);
  destination := private.api_find_account(user_ref, to_ref);
  if source_account.type = 'credit_card' or destination.type = 'credit_card' then
    raise exception 'Transfers are only between checking and savings. Pay cards in the app.'
      using errcode = 'check_violation';
  end if;

  -- create_transfer acts as the signed-in user; act as this token's owner.
  perform set_config('request.jwt.claims', jsonb_build_object('sub', user_ref, 'role', 'authenticated')::text, true);
  created := public.create_transfer(source_account.id, destination.id, amount_cents, coalesce(on_date, current_date), note, 'shortcut');

  return jsonb_build_object(
    'id', created.id,
    'from', source_account.name,
    'to', destination.name,
    'amount_cents', created.amount_cents,
    'date', created.date
  );
end;
$$;

revoke execute on function
  public.api_user_for_token, public.api_info, public.api_money_left,
  public.api_add_transaction, public.api_transfer
from public, anon, authenticated;
grant execute on function
  public.api_user_for_token, public.api_info, public.api_money_left,
  public.api_add_transaction, public.api_transfer
to service_role;

