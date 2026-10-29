begin;
select plan(3);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@test.dev');
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok($$
  insert into public.accounts (name, type, card_color) values ('Venture X', 'credit_card', 'copper')
$$, 'a card can be given a color');

select is((select card_color from public.accounts where name = 'Venture X'), 'copper', 'the color is stored');

select throws_ok($$
  insert into public.accounts (name, type, card_color) values ('Odd Card', 'credit_card', 'tangerine')
$$, '23514', null, 'only the listed colors are allowed');

select * from finish();
rollback;
