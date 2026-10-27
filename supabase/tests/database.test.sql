begin;
select plan(24);

-- ---------------------------------------------------------------- helpers
create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

create function pg_temp.logout() returns void language sql as $$
  reset role;
  select set_config('request.jwt.claims', null, true);
$$;

-- ------------------------------------------------------------------ users
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev');

select is((select count(*) from public.profiles)::int, 2, 'a profile is created for each new user');

-- --------------------------------------------------------------- accounts
select pg_temp.login('00000000-0000-0000-0000-00000000000a');

select lives_ok($$
  insert into public.accounts (id, name, alias, type, opening_balance_cents) values
    ('00000000-0000-0000-0000-0000000000c1', 'General Checking', 'general', 'checking', 100000),
    ('00000000-0000-0000-0000-0000000000c2', 'Savings', 'savings', 'savings', 0);
  insert into public.accounts (id, name, alias, type, credit_limit_cents, wallet_name) values
    ('00000000-0000-0000-0000-0000000000d1', 'Venture X', 'vx', 'credit_card', 1000000, 'Venture X Card');
$$, 'users can create checking, savings and card accounts');

select throws_ok($$
  insert into public.accounts (name, type, opening_balance_cents) values ('Bad Card', 'credit_card', 500)
$$, '23514', null, 'credit cards must start at 0');

select throws_ok($$
  insert into public.accounts (name, type) values ('general checking', 'checking')
$$, '23505', null, 'account names are unique per user, ignoring case');

select throws_ok($$
  update public.accounts set type = 'savings' where id = '00000000-0000-0000-0000-0000000000c1'
$$, '23514', 'An account''s type cannot be changed.', 'account type cannot change');

-- ------------------------------------------------------------- categories
select lives_ok($$
  insert into public.categories (id, name) values ('00000000-0000-0000-0000-0000000000e1', 'Shopping');
  insert into public.categories (id, name, parent_id) values
    ('00000000-0000-0000-0000-0000000000e2', 'Clothing', '00000000-0000-0000-0000-0000000000e1');
$$, 'users can create a category and a subcategory');

select throws_ok($$
  insert into public.categories (name, parent_id) values ('Shoes', '00000000-0000-0000-0000-0000000000e2')
$$, '23514', 'A subcategory cannot have its own subcategories.', 'categories are at most two levels deep');

select throws_ok($$
  delete from public.categories where id = '00000000-0000-0000-0000-0000000000e1'
$$, '23503', null, 'a category with subcategories cannot be deleted');

-- ----------------------------------------------------------- transactions
select throws_ok($$
  insert into public.transactions (account_id, amount_cents) values ('00000000-0000-0000-0000-0000000000d1', 8000)
$$, '23514', 'Credit card transactions need a category.', 'card transactions require a category');

select lives_ok($$
  insert into public.transactions (account_id, amount_cents, category_id, merchant)
  values ('00000000-0000-0000-0000-0000000000d1', 8000, '00000000-0000-0000-0000-0000000000e2', 'Uniqlo')
$$, 'a categorized card charge is accepted');

select lives_ok($$
  insert into public.transactions (account_id, amount_cents, description)
  values ('00000000-0000-0000-0000-0000000000c1', 2000, 'Venmo from Sam')
$$, 'deposits may leave the category empty');

select throws_ok($$
  insert into public.transactions (account_id, amount_cents, kind, transfer_id)
  values ('00000000-0000-0000-0000-0000000000c1', -100, 'payment', gen_random_uuid())
$$, '42501', null, 'clients cannot write transfer or payment rows directly');

select throws_ok($$
  insert into public.transactions (account_id, amount_cents, category_id) values ('00000000-0000-0000-0000-0000000000e1', 1, null)
$$, '23503', null, 'transactions must point at an existing account');

-- -------------------------------------------------------------- transfers
select is(
  (select kind::text from public.create_transfer(
    '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000d1', 5000)),
  'payment', 'checking → card is a payment');

select results_eq($$
  select amount_cents from public.transactions where kind = 'payment' order by account_id
$$, $$ values (-5000::bigint), (-5000::bigint) $$, 'a payment is negative on both sides');

select is(
  (select kind::text from public.create_transfer(
    '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2', 3000)),
  'transfer', 'checking → savings is a transfer');

select results_eq($$
  select amount_cents from public.transactions where kind = 'transfer' order by amount_cents
$$, $$ values (-3000::bigint), (3000::bigint) $$, 'a transfer is −X from and +X to');

select throws_ok($$
  select public.create_transfer('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1', 100)
$$, '23514', null, 'money cannot move out of a credit card');

select throws_ok($$
  select public.create_transfer('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2', 0)
$$, '23514', 'Amount must be greater than zero.', 'transfer amounts must be positive');

select results_eq($$
  select balance_cents from public.account_balances order by account_id
$$, $$ values (94000::bigint), (3000::bigint), (3000::bigint) $$,
  'balances: checking 1000 + 20 − 50 − 30, savings +30, card owes 80 − 50');

-- ------------------------------------------------------------- isolation
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000b');

select is((select count(*) from public.accounts)::int, 0, 'users cannot see other users'' accounts');
select is((select count(*) from public.transactions)::int, 0, 'users cannot see other users'' transactions');

select throws_ok($$
  select public.create_transfer('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2', 100)
$$, 'P0002', 'Account not found.', 'users cannot move money between other users'' accounts');

select pg_temp.logout();
set local role anon;
select throws_ok($$ select * from public.accounts $$, '42501', null, 'signed-out visitors have no access');

select * from finish();
rollback;
