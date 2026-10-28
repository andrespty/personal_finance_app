begin;
select plan(20);

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

-- ------------------------------------------------------------- tokens
select pg_temp.login('00000000-0000-0000-0000-00000000000a');

create temp table t_token on commit drop as select public.create_api_token('iPhone') as token;
grant select on t_token to authenticated, service_role;

select matches((select token from t_token), '^pfa_[0-9a-f]{48}$', 'tokens look like pfa_ + 48 hex characters');

select throws_ok($$ select token_hash from public.api_tokens $$, '42501', null,
  'people cannot read token hashes');

select is((select token_prefix from public.api_tokens), (select left(token, 10) from t_token),
  'the prefix is stored so tokens can be told apart');

insert into public.accounts (id, name, alias, type, opening_balance_cents) values
  ('00000000-0000-0000-0000-0000000000c1', 'General Checking', 'general', 'checking', 300000),
  ('00000000-0000-0000-0000-0000000000c2', 'Savings', 'savings', 'savings', 0);
insert into public.accounts (id, name, alias, wallet_name, type) values
  ('00000000-0000-0000-0000-0000000000d1', 'Venture X', 'vx', 'Venture X Card', 'credit_card');
select public.add_categories('[{"name": "Other"}, {"name": "Shopping", "children": ["Other", "Clothing"]}, {"name": "Kids", "children": ["Clothing"]}, {"name": "Food"}]');
select public.save_card_payers('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1');

select throws_ok($$ select public.api_info('00000000-0000-0000-0000-00000000000a') $$, '42501', null,
  'signed-in people cannot call the API functions directly');

-- ----------------------------------------------------------- as API
select pg_temp.logout();
set local role service_role;

select is(public.api_user_for_token((select token from t_token)), '00000000-0000-0000-0000-00000000000a'::uuid,
  'a valid token resolves to its owner');
select is(public.api_user_for_token('pfa_nope'), null, 'an unknown token resolves to nobody');
reset role;
select isnt((select last_used_at from public.api_tokens), null, 'using a token records when');
set local role service_role;

select is(public.api_info('00000000-0000-0000-0000-00000000000a') -> 'categories', '["Food", "Kids", "Shopping", "Other"]'::jsonb,
  'info lists top-level category names, with Other last');
select is(public.api_info('00000000-0000-0000-0000-00000000000a') -> 'subcategories',
  '{"Food": [], "Kids": ["Clothing"], "Other": [], "Shopping": ["Clothing", "Other"]}'::jsonb,
  'subcategories are listed under their category''s name, empty when there are none');
select is(public.api_info('00000000-0000-0000-0000-00000000000a') -> 'cards' -> 0 ->> 'wallet_name', 'Venture X Card',
  'cards include their Wallet name');

select lives_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000a', 'card', 'Venture X Card', 5412, 'shopping/clothing', null, 'Uniqlo')
$$, 'a card charge can be logged by Wallet name and category path');

reset role;
select is((select source::text from public.transactions where merchant = 'Uniqlo'), 'shortcut',
  'API transactions are marked as coming from a Shortcut');
set local role service_role;

select throws_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000a', 'card', 'vx', 100, 'Clothing')
$$, '23514', 'More than one category is named "Clothing". Use Parent/Child, like Shopping/Clothing.',
  'ambiguous category names ask for the full path');

select throws_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000a', 'card', 'vx', 100)
$$, '23514', 'Credit card transactions need a category.', 'card transactions still need a category');

select throws_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000a', 'card', 'general', 100, 'Food')
$$, '23514', '"General Checking" is not a credit card.', 'card endpoint rejects bank accounts');

select lives_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000a', 'bank', 'GENERAL', 20000, null, 'Paycheck')
$$, 'a deposit can be logged by alias, ignoring case, without a category');

select is(
  (public.api_transfer('00000000-0000-0000-0000-00000000000a', 'general', 'savings', 5000) ->> 'to'),
  'Savings', 'transfers move money between bank accounts');

select throws_ok($$
  select public.api_transfer('00000000-0000-0000-0000-00000000000a', 'general', 'vx', 5000)
$$, '23514', 'Transfers are only between checking and savings. Pay cards in the app.',
  'the API does not make card payments');

select results_eq($$
  select (m ->> 'money_left_cents')::bigint
  from jsonb_array_elements(public.api_money_left('00000000-0000-0000-0000-00000000000a')) m
$$, $$ values (309588::bigint), (5000::bigint) $$,
  'money left: General 3000 + 200 − 50 − 54.12 on the card; Savings 50');

select throws_ok($$
  select public.api_add_transaction('00000000-0000-0000-0000-00000000000b', 'card', 'vx', 100, 'Food')
$$, 'P0002', 'No account named "vx".', 'one user''s token cannot reach another user''s accounts');

select * from finish();
rollback;
