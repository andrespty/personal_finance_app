import { ListRow } from '@/components/ui'
import type { Account } from '@/features/accounts'
import { formatCents } from '@/lib/money'

import type { MoneyLeft } from '../../types'

/** A checking/savings account showing what's left after card shares. */
export function MoneyLeftRow({ account, moneyLeft }: { account: Account; moneyLeft?: MoneyLeft }) {
  const covers = moneyLeft?.coversCents ?? 0
  return (
    <ListRow
      to={`/accounts/${account.id}`}
      title={account.name}
      subtitle={
        covers > 0
          ? `Balance ${formatCents(account.balanceCents)} · ${formatCents(covers)} for cards`
          : `Balance ${formatCents(account.balanceCents)}`
      }
      trailing={
        <div className="num text-right text-[15px] font-semibold whitespace-nowrap">
          {formatCents(moneyLeft?.moneyLeftCents ?? account.balanceCents)}
          <div className="text-muted text-xs font-normal">left</div>
        </div>
      }
    />
  )
}
