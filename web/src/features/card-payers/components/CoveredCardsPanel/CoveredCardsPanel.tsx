import { EmptyState, ListRow, LoadingBlock } from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { formatCents } from '@/lib/money'

import { usePayerShares } from '../../api/cardPayers.queries'

/** Checking/savings detail tab: what this account is setting aside for each card. */
export function CoveredCardsPanel({ accountId }: { accountId: string }) {
  const shares = usePayerShares((s) => s.payerAccountId === accountId && s.shareCents > 0)
  const { data: accounts = [] } = useAccounts({ includeArchived: true })

  if (shares.isPending) return <LoadingBlock />
  if (!shares.data?.length) {
    return (
      <EmptyState
        title="Nothing set aside"
        body="When this account pays a card, its share of that card shows here."
      />
    )
  }
  return (
    <div className="flex flex-col">
      {shares.data.map((share) => (
        <ListRow
          key={share.cardId}
          to={`/accounts/${share.cardId}`}
          title={accounts.find((a) => a.id === share.cardId)?.name ?? 'Card'}
          subtitle="Its share of this card"
          trailing={
            <span className="num text-[15px] font-semibold">{formatCents(share.shareCents)}</span>
          }
        />
      ))}
    </div>
  )
}
