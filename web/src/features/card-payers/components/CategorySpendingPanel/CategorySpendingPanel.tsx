import { useState } from 'react'

import { EmptyState, ListRow, LoadingBlock } from '@/components/ui'
import { useAccounts, type Account } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { formatCents } from '@/lib/money'

import { useCardSpending } from '../../api/cardPayers.queries'
import { monthStart, spendingByCategory } from '../../utils/shares'

const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })

/** Card detail tab: this month's spending by category, with who pays each. */
export function CategorySpendingPanel({ card }: { card: Account }) {
  // Fixed when the tab opens, so re-renders don't jump months at midnight.
  const [now] = useState(() => new Date())
  const spending = useCardSpending(card.id, monthStart(now))
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()

  if (spending.isPending) return <LoadingBlock />
  const groups = spendingByCategory(spending.data ?? [], accounts, categories)
  const month = monthName.format(now)

  if (groups.length === 0) return <EmptyState title={`No charges in ${month} yet.`} />

  const total = groups.reduce((sum, g) => sum + g.cents, 0)
  return (
    <div className="flex flex-col">
      <p className="text-muted pt-1 pb-2 text-sm">
        {month}: <span className="num text-fg font-medium">{formatCents(total)}</span>
      </p>
      {groups.map((group) => (
        <ListRow
          key={group.categoryId ?? 'none'}
          title={group.label}
          subtitle={`Paid by ${group.payerName}`}
          trailing={
            <span className="num text-[15px] font-semibold">{formatCents(group.cents)}</span>
          }
        />
      ))}
    </div>
  )
}
