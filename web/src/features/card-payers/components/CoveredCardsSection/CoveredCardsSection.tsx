import { ListRow, Section } from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { formatCents } from '@/lib/money'

import { usePayerShares } from '../../api/cardPayers.queries'

/** Checking/savings detail: what this account is setting aside for each card. */
export function CoveredCardsSection({ accountId }: { accountId: string }) {
  const shares = usePayerShares((s) => s.payerAccountId === accountId && s.shareCents > 0)
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  if (!shares.data?.length) return null

  return (
    <Section title="Set aside for cards">
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
    </Section>
  )
}
