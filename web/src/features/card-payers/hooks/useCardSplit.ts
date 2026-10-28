import { useAccounts } from '@/features/accounts'

import { usePayerShares } from '../api/cardPayers.queries'
import { cardSplit } from '../utils/shares'

/** A card's balance split by payer, for drawing on the card. */
export function useCardSplit(cardId: string) {
  const { data: shares = [] } = usePayerShares()
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  return cardSplit(cardId, shares, accounts)
}
