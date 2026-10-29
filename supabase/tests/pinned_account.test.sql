begin;
select plan(5);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev');
insert into public.accounts (id, user_id, name, type) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Fun Checking', 'checking'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000b', 'B Checking', 'checking'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-00000000000a', 'Savings', 'savings');
insert into public.accounts (id, user_id, name, type) values
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'Venture X', 'credit_card');

select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok($$
  update public.profiles set pinned_account_id = '10000000-0000-0000-0000-000000000001'
$$, 'a checking account can be pinned');

select throws_ok($$
  update public.profiles set pinned_account_id = '10000000-0000-0000-0000-000000000002'
$$, '23514', null, 'a card cannot be pinned');

select throws_ok($$
  update public.profiles set pinned_account_id = '10000000-0000-0000-0000-000000000003'
$$, '23503', null, 'another user''s account cannot be pinned');

update public.profiles set pinned_account_id = '10000000-0000-0000-0000-000000000004';
delete from public.accounts where id = '10000000-0000-0000-0000-000000000004';

select is((select pinned_account_id from public.profiles), null, 'deleting the account unpins it');

select is((select count(*)::int from public.profiles), 1, 'the profile itself is kept');

select * from finish();
rollback;
