begin;
select plan(7);

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@test.dev');

select is(
  (select onboarding_step from public.profiles where user_id = '00000000-0000-0000-0000-00000000000a')::int,
  0, 'new users start guided setup at step 0');

select pg_temp.login('00000000-0000-0000-0000-00000000000a');

select lives_ok($$
  select public.add_categories('[
    {"name": "Food", "children": ["Groceries", "Coffee"]},
    {"name": "Other"}
  ]'::jsonb)
$$, 'add_categories creates parents and children');

select is((select count(*) from public.categories)::int, 4, 'four categories were created');

select is(
  (select p.name from public.categories c join public.categories p on p.id = c.parent_id where c.name = 'Coffee'),
  'Food', 'subcategories are attached to their parent');

select lives_ok($$
  select public.add_categories('[{"name": "food", "children": ["Coffee", "Bakery"]}]'::jsonb)
$$, 'running it again with overlapping names does not fail');

select is((select count(*) from public.categories)::int, 5, 'existing names are reused, new ones added');

select throws_ok($$ select public.add_categories('{"name": "Food"}'::jsonb) $$,
  '22023', 'Categories must be a list.', 'input must be a list');

select * from finish();
rollback;
