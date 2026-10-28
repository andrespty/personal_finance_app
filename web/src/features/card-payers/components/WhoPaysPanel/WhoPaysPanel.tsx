import { useState } from 'react'

import { Button, LoadingBlock, Sheet } from '@/components/ui'
import { useAccounts, type Account } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

import { usePayerSetup, usePayerShares } from '../../api/cardPayers.queries'
import { payerRows, percentOf } from '../../utils/shares'
import { CardPayersForm } from '../CardPayersForm/CardPayersForm'

/**
 * Card detail tab: one bar for the whole balance, split by the accounts that
 * pay it, with a matching row per account.
 */
export function WhoPaysPanel({ card }: { card: Account }) {
  const [editing, setEditing] = useState(false)
  const setup = usePayerSetup(card.id)
  const shares = usePayerShares((s) => s.cardId === card.id)
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()

  if (!setup.data || !shares.data) return <LoadingBlock />

  const rows = payerRows(setup.data, shares.data, accounts, categories)
  const positive = rows.filter((r) => r.shareCents > 0)
  const total = positive.reduce((sum, r) => sum + r.shareCents, 0)

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div>
        <p className="text-muted text-sm">Owed by account</p>
        <p className="num mt-0.5 text-[30px] font-semibold tracking-[-0.03em]">
          {formatCents(total)}
        </p>
        {total > 0 && (
          <div className="mt-3 flex h-2.5 gap-[3px]" aria-hidden="true">
            {positive.map((row) => (
              <span
                key={row.key}
                className="rounded-[3px]"
                style={{ flex: row.shareCents, background: row.color }}
              />
            ))}
          </div>
        )}
      </div>

      <ul className="border-border flex flex-col border-t">
        {rows.map((row) => {
          const percent = percentOf(row.shareCents, total)
          const uncovered = row.key === 'uncovered'
          return (
            <li key={row.key} className="border-border flex items-start gap-3 border-b py-3.5">
              <span
                className="mt-[5px] size-2.5 flex-none rounded-full"
                style={{ background: row.color }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={cn('truncate text-[15px] font-medium', uncovered && 'text-negative')}
                >
                  {row.name}
                </div>
                <div className="text-muted mt-0.5 truncate text-[13px]">{row.detail}</div>
              </div>
              <div
                className={cn(
                  'num text-right text-[15px] font-semibold',
                  uncovered && 'text-negative',
                )}
              >
                {formatCents(row.shareCents)}
                {percent !== null && (
                  <div className="text-muted text-xs font-normal">{percent}%</div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <Button variant="secondary" onClick={() => setEditing(true)}>
        Change who pays
      </Button>

      <Sheet open={editing} onClose={() => setEditing(false)} title={`Who pays ${card.name}`}>
        <CardPayersForm cardId={card.id} onDone={() => setEditing(false)} />
      </Sheet>
    </div>
  )
}
