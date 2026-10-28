import { useState } from 'react'

import { Button, EmptyState, ListRow, LoadingBlock, Sheet } from '@/components/ui'
import { useAccounts, type Account } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

import { usePayerSetup, usePayerShares } from '../../api/cardPayers.queries'
import { isConfigured } from '../../utils/payerSetup'
import { payerRows } from '../../utils/shares'
import { CardPayersForm } from '../CardPayersForm/CardPayersForm'

/** Card detail tab: what each paying account owes, and editing who pays. */
export function WhoPaysPanel({ card }: { card: Account }) {
  const [editing, setEditing] = useState(false)
  const setup = usePayerSetup(card.id)
  const shares = usePayerShares((s) => s.cardId === card.id)
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()

  if (!setup.data || !shares.data) return <LoadingBlock />

  const configured = isConfigured(setup.data)
  const rows = payerRows(setup.data, shares.data, accounts, categories)
  const largest = Math.max(1, ...rows.map((r) => r.shareCents))

  return (
    <div className="flex flex-col">
      {!configured && (
        <EmptyState
          title="Choose who pays this card"
          body="Pick the account that pays it. You can split some categories to another account."
        />
      )}
      {rows.map((row) => (
        <ListRow
          key={row.key}
          title={row.name}
          subtitle={
            <>
              {row.detail}
              <span className="bg-fill mt-2 block h-1 overflow-hidden rounded-full">
                <span
                  className={cn(
                    'block h-full',
                    row.key === 'uncovered' ? 'bg-negative' : 'bg-accent',
                  )}
                  style={{ width: `${Math.max(0, (row.shareCents / largest) * 100)}%` }}
                />
              </span>
            </>
          }
          trailing={
            <span
              className={cn(
                'num text-[15px] font-semibold',
                row.key === 'uncovered' && 'text-negative',
              )}
            >
              {formatCents(row.shareCents)}
            </span>
          }
        />
      ))}
      <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
        {configured ? 'Change who pays' : 'Choose accounts'}
      </Button>

      <Sheet open={editing} onClose={() => setEditing(false)} title={`Who pays ${card.name}`}>
        <CardPayersForm cardId={card.id} onDone={() => setEditing(false)} />
      </Sheet>
    </div>
  )
}
