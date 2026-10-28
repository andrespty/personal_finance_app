import { useState } from 'react'

import { Button, EmptyState, ListRow, Section, Sheet } from '@/components/ui'
import { useAccounts, type Account } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

import { useCardSpending, usePayerSetup, usePayerShares } from '../../api/cardPayers.queries'
import { isConfigured } from '../../utils/payerSetup'
import { monthStart, payerRows, spendingByCategory } from '../../utils/shares'
import { CardPayersForm } from '../CardPayersForm/CardPayersForm'

/** Card detail: who pays what, and this month's spending by category. */
export function WhoPaysSection({ card }: { card: Account }) {
  const [editing, setEditing] = useState(false)
  const setup = usePayerSetup(card.id)
  const shares = usePayerShares((s) => s.cardId === card.id)
  const spending = useCardSpending(card.id, monthStart())
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()

  if (!setup.data || !shares.data) return null

  const rows = payerRows(setup.data, shares.data, accounts, categories)
  const largest = Math.max(1, ...rows.map((r) => r.shareCents))
  const byCategory = spendingByCategory(spending.data ?? [], accounts, categories)

  return (
    <>
      <Section
        title="Who pays"
        action={{
          label: isConfigured(setup.data) ? 'Edit' : 'Set up',
          onClick: () => setEditing(true),
        }}
      >
        {!isConfigured(setup.data) ? (
          <EmptyState
            title="Choose who pays this card"
            body="Pick the account that pays it. You can split some categories to another account."
            action={<Button onClick={() => setEditing(true)}>Choose accounts</Button>}
          />
        ) : null}
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
      </Section>

      {byCategory.length > 0 && (
        <Section title="This month by category">
          {byCategory.map((group) => (
            <ListRow
              key={group.categoryId ?? 'none'}
              title={group.label}
              subtitle={`Paid by ${group.payerName}`}
              trailing={
                <span className="num text-[15px] font-semibold">{formatCents(group.cents)}</span>
              }
            />
          ))}
        </Section>
      )}

      <Sheet open={editing} onClose={() => setEditing(false)} title={`Who pays ${card.name}`}>
        <CardPayersForm cardId={card.id} onDone={() => setEditing(false)} />
      </Sheet>
    </>
  )
}
