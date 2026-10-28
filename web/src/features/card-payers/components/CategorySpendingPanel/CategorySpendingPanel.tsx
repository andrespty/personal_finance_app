import { useState } from 'react'

import { EmptyState, LoadingBlock } from '@/components/ui'
import type { Account } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { formatCents } from '@/lib/money'

import { useCardSpending, usePayerSetup } from '../../api/cardPayers.queries'
import { groupSpending, monthStart, payerColor, percentOf } from '../../utils/shares'

const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })

/**
 * Card detail tab: this month's spending by category, each parent with its
 * share of the month and its subcategories underneath. Dots use the paying
 * account's color from Who pays.
 */
export function CategorySpendingPanel({ card }: { card: Account }) {
  // Fixed when the tab opens, so re-renders don't jump months at midnight.
  const [now] = useState(() => new Date())
  const spending = useCardSpending(card.id, monthStart(now))
  const setup = usePayerSetup(card.id)
  const { data: categories = [] } = useCategories()

  if (spending.isPending || !setup.data) return <LoadingBlock />
  const groups = groupSpending(spending.data ?? [], categories)
  const month = monthName.format(now)

  if (groups.length === 0) return <EmptyState title={`No charges in ${month} yet.`} />

  const total = groups.reduce((sum, g) => sum + g.cents, 0)
  return (
    <div className="flex flex-col pt-2">
      <div className="flex items-baseline justify-between pb-2">
        <span className="text-[15px] font-semibold">{month}</span>
        <span className="num text-[15px] font-semibold">{formatCents(total)}</span>
      </div>
      <ul className="border-border flex flex-col border-t">
        {groups.map((group) => {
          const percent = percentOf(group.cents, total)
          return (
            <li key={group.key} className="border-border border-b pt-3 pb-2">
              <div className="flex items-baseline gap-3">
                <span className="flex-1 truncate text-[15px] font-semibold">{group.name}</span>
                {percent !== null && <span className="num text-muted text-[13px]">{percent}%</span>}
                <span className="num w-24 text-right text-[15px] font-semibold">
                  {formatCents(group.cents)}
                </span>
              </div>
              <ul className="mt-1 flex flex-col">
                {group.lines.map((line) => (
                  <li key={line.key} className="flex items-center gap-2.5 py-1.5 pl-5 text-sm">
                    <span
                      className="size-2 flex-none rounded-full"
                      style={{ background: payerColor(setup.data, line.payerAccountId) }}
                      aria-hidden="true"
                    />
                    <span className="text-muted flex-1 truncate">{line.name}</span>
                    <span className="num">{formatCents(line.cents)}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <p className="text-muted pt-3 text-[13px]">Dots show which account pays, as in Who pays.</p>
    </div>
  )
}
