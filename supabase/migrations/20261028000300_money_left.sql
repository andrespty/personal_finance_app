-- Who pays for each card transaction.
--   Regular charges/refunds: the payer whose rule matches the category, then
--   the rule on its parent category, then the card's default payer.
--   Payments: the account the payment came from.
-- Rules are looked up here, at read time, so changing them applies to past
-- transactions too. payer_account_id is null when nothing matches.
create view public.card_transaction_payers
with (security_invoker = true)
as
select
  t.id as transaction_id,
  t.user_id,
  t.account_id as card_id,
  t.kind,
  t.date,
  t.category_id,
  t.amount_cents,
  case
    when t.kind = 'payment' then tr.from_account_id
    else coalesce(own_rule.payer_account_id, parent_rule.payer_account_id, default_payer.payer_account_id)
  end as payer_account_id
from public.transactions t
join public.accounts card on card.id = t.account_id and card.type = 'credit_card'
left join public.transfers tr on tr.id = t.transfer_id
left join public.categories c on c.id = t.category_id
left join lateral (
  select cp.payer_account_id
  from public.card_payer_categories r
  join public.card_payers cp on cp.id = r.card_payer_id
  where r.card_id = t.account_id and r.category_id = t.category_id
) own_rule on true
left join lateral (
  select cp.payer_account_id
  from public.card_payer_categories r
  join public.card_payers cp on cp.id = r.card_payer_id
  where r.card_id = t.account_id and r.category_id = c.parent_id
) parent_rule on true
left join public.card_payers default_payer
  on default_payer.card_id = t.account_id and default_payer.is_default
where t.kind in ('regular', 'payment');

-- What each payer owes on each card: its charges and refunds minus its
-- payments. A null payer_account_id is the part no payer covers.
create view public.card_payer_shares
with (security_invoker = true)
as
select card_id, user_id, payer_account_id, sum(amount_cents)::bigint as share_cents
from public.card_transaction_payers
group by card_id, user_id, payer_account_id;

-- Money left in each checking/savings account after setting aside what it
-- owes on the cards it pays. Overpaying a card doesn't add money back.
create view public.account_money_left
with (security_invoker = true)
as
select
  a.id as account_id,
  a.user_id,
  b.balance_cents,
  coalesce(sum(greatest(s.share_cents, 0)), 0)::bigint as covers_cents,
  (b.balance_cents - coalesce(sum(greatest(s.share_cents, 0)), 0))::bigint as money_left_cents
from public.accounts a
join public.account_balances b on b.account_id = a.id
left join public.card_payer_shares s on s.payer_account_id = a.id
where a.type <> 'credit_card'
group by a.id, a.user_id, b.balance_cents;

grant select on public.card_transaction_payers to authenticated;
grant select on public.card_payer_shares to authenticated;
grant select on public.account_money_left to authenticated;
