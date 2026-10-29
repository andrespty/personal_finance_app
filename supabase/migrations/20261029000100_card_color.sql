-- The color a credit card is drawn in. Stored as a name so the exact shades
-- can change in the app without touching data. Null means the default
-- (forest); only cards use it.
alter table public.accounts
  add column card_color text
  check (card_color in (
    'forest', 'graphite', 'navy', 'petrol', 'plum', 'burgundy',
    'espresso', 'copper', 'black', 'champagne', 'silver'
  ));

comment on column public.accounts.card_color is
  'Credit card color name (forest, graphite, navy, …). Null = forest.';

-- Cards used to alternate forest/graphite by position (oldest first); keep
-- each existing card looking the same.
update public.accounts a
set card_color = case when ranked.position % 2 = 1 then 'forest' else 'graphite' end
from (
  select id, row_number() over (partition by user_id order by created_at) as position
  from public.accounts
  where type = 'credit_card' and not archived
) ranked
where a.id = ranked.id;
