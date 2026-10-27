-- Current balance of every account. For credit cards this is the amount
-- owed (positive = you owe).
create view public.account_balances
with (security_invoker = true)
as
select
  a.id as account_id,
  a.user_id,
  a.opening_balance_cents + coalesce(sum(t.amount_cents), 0)::bigint as balance_cents
from public.accounts a
left join public.transactions t on t.account_id = a.id
group by a.id;

grant select on public.account_balances to authenticated;
