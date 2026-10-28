begin;
select plan(21);

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;
create function pg_temp.logout() returns void language sql as $$
  reset role;
  select set_config('request.jwt.claims', null, true);
$$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev');

select pg_temp.login('00000000-0000-0000-0000-00000000000a');

-- General Checking $3,000, Fun Checking $500, Venture X.
insert into public.accounts (id, name, type, opening_balance_cents) values
  ('00000000-0000-0000-0000-0000000000c1', 'General Checking', 'checking', 300000),
  ('00000000-0000-0000-0000-0000000000c2', 'Fun Checking', 'checking', 50000);
insert into public.accounts (id, name, type) values
  ('00000000-0000-0000-0000-0000000000d1', 'Venture X', 'credit_card');

-- Shopping › Clothing, Entertainment › Gaming, Food › Groceries
insert into public.categories (id, name) values
  ('00000000-0000-0000-0000-0000000000e1', 'Shopping'),
  ('00000000-0000-0000-0000-0000000000e3', 'Entertainment'),
  ('00000000-0000-0000-0000-0000000000e5', 'Food');
insert into public.categories (id, name, parent_id) values
  ('00000000-0000-0000-0000-0000000000e2', 'Clothing', '00000000-0000-0000-0000-0000000000e1'),
  ('00000000-0000-0000-0000-0000000000e4', 'Gaming', '00000000-0000-0000-0000-0000000000e3'),
  ('00000000-0000-0000-0000-0000000000e6', 'Groceries', '00000000-0000-0000-0000-0000000000e5');

-- Charges: Clothing $100, Gaming $50, Groceries $300.
insert into public.transactions (account_id, amount_cents, category_id) values
  ('00000000-0000-0000-0000-0000000000d1', 10000, '00000000-0000-0000-0000-0000000000e2'),
  ('00000000-0000-0000-0000-0000000000d1', 5000, '00000000-0000-0000-0000-0000000000e4'),
  ('00000000-0000-0000-0000-0000000000d1', 30000, '00000000-0000-0000-0000-0000000000e6');

select results_eq($$
  select payer_account_id, share_cents from public.card_payer_shares
$$, $$ values ('00000000-0000-0000-0000-0000000000c1'::uuid, 45000::bigint) $$,
  'a new card is paid by the first checking account until set otherwise');

-- Fun pays Clothing (subcategory rule) and Entertainment (parent rule);
-- General is the default.
select lives_ok($$
  select public.save_card_payers(
    '00000000-0000-0000-0000-0000000000d1',
    '00000000-0000-0000-0000-0000000000c1',
    '[{"payer_account_id": "00000000-0000-0000-0000-0000000000c2",
       "category_ids": ["00000000-0000-0000-0000-0000000000e2", "00000000-0000-0000-0000-0000000000e3"]}]'
  )
$$, 'save_card_payers stores a default and a category rule');

select is((select count(*) from public.card_payers)::int, 2, 'two payers are stored');

select results_eq($$
  select payer_account_id, share_cents from public.card_payer_shares order by share_cents
$$, $$ values
  ('00000000-0000-0000-0000-0000000000c2'::uuid, 15000::bigint),
  ('00000000-0000-0000-0000-0000000000c1'::uuid, 30000::bigint)
$$, 'Fun covers Clothing + Gaming (via its parent); General covers the rest');

-- Fun pays $60 toward the card.
select public.create_transfer('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000d1', 6000);

select is(
  (select share_cents from public.card_payer_shares where payer_account_id = '00000000-0000-0000-0000-0000000000c2'),
  9000::bigint, 'a payment only reduces the share of the account it came from');

select results_eq($$
  select account_id, balance_cents, covers_cents, money_left_cents from public.account_money_left order by account_id
$$, $$ values
  ('00000000-0000-0000-0000-0000000000c1'::uuid, 300000::bigint, 30000::bigint, 270000::bigint),
  ('00000000-0000-0000-0000-0000000000c2'::uuid, 44000::bigint, 9000::bigint, 35000::bigint)
$$, 'money left = balance − share on the cards each account pays');

-- A rule on the subcategory beats the rule on its parent.
select public.save_card_payers(
  '00000000-0000-0000-0000-0000000000d1',
  '00000000-0000-0000-0000-0000000000c1',
  '[{"payer_account_id": "00000000-0000-0000-0000-0000000000c2",
     "category_ids": ["00000000-0000-0000-0000-0000000000e3"]},
    {"payer_account_id": "00000000-0000-0000-0000-0000000000c1",
     "category_ids": ["00000000-0000-0000-0000-0000000000e4"]}]'
);
select is(
  (select payer_account_id from public.card_transaction_payers where category_id = '00000000-0000-0000-0000-0000000000e4'),
  '00000000-0000-0000-0000-0000000000c1'::uuid, 'a subcategory rule overrides its parent''s rule');

select is(
  (select share_cents from public.card_payer_shares where payer_account_id = '00000000-0000-0000-0000-0000000000c1'),
  45000::bigint, 'changing rules applies to past transactions');

select is((select count(*) from public.card_payers where is_default)::int, 1,
  'listing the default payer in a rule too keeps a single default');

-- Overpaying from Fun doesn't raise its money left.
select public.create_transfer('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000d1', 1000);
select is(
  (select covers_cents from public.account_money_left where account_id = '00000000-0000-0000-0000-0000000000c2'),
  0::bigint, 'an overpaid share counts as zero, not negative');

-- Validation
select throws_ok($$
  select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d1')
$$, '23514', 'A card must be paid from a checking or savings account.', 'a card cannot pay a card');

select throws_ok($$
  select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1',
    '[{"payer_account_id": "00000000-0000-0000-0000-0000000000c1", "category_ids": ["00000000-0000-0000-0000-0000000000e2"]},
      {"payer_account_id": "00000000-0000-0000-0000-0000000000c2", "category_ids": ["00000000-0000-0000-0000-0000000000e2"]}]')
$$, '23514', 'A category can only have one payer per card.', 'a category has one payer per card');

select throws_ok($$
  select public.save_card_payers('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2')
$$, 'P0002', 'Card not found.', 'only credit cards have payers');

select is((select count(*) from public.card_payers)::int, 2, 'a failed save leaves the previous setup in place');

select throws_ok($$
  select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', null)
$$, '23514', 'Choose the account that pays for everything else.', 'every card needs a default payer');

-- An account with no transactions of its own, used only as a payer.
insert into public.accounts (id, name, type) values ('00000000-0000-0000-0000-0000000000c3', 'Spare', 'checking');
select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c3');

select throws_ok($$ delete from public.accounts where id = '00000000-0000-0000-0000-0000000000c3' $$,
  '23503', null, 'an account that pays a card cannot be deleted');

select lives_ok($$ update public.accounts set archived = true where id = '00000000-0000-0000-0000-0000000000c3' $$,
  'an account that pays a card can still be archived');

-- Isolation
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000b');

select is((select count(*) from public.card_payer_shares)::int, 0, 'users cannot see other users'' card shares');

select throws_ok($$
  select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1')
$$, 'P0002', 'Card not found.', 'users cannot change other users'' cards');

-- A card added before any bank account gets one once a bank account exists.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
insert into public.accounts (id, name, type) values ('00000000-0000-0000-0000-0000000000d9', 'Early Card', 'credit_card');
select is((select count(*) from public.card_payers)::int, 0, 'a card with no bank accounts yet has no payer');
insert into public.accounts (id, name, type) values ('00000000-0000-0000-0000-0000000000c9', 'First Savings', 'savings');
select is(
  (select payer_account_id from public.card_payers where card_id = '00000000-0000-0000-0000-0000000000d9' and is_default),
  '00000000-0000-0000-0000-0000000000c9'::uuid, 'the first bank account becomes its default payer');

select * from finish();
rollback;
