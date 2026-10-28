import { accountKeys } from '@/features/accounts'

// Nested under accounts so anything that refreshes balances refreshes these too.
export const cardPayerKeys = {
  setups: [...accountKeys.all, 'card-payers'] as const,
  shares: [...accountKeys.all, 'payer-shares'] as const,
  spending: (cardId: string, since: string) =>
    [...accountKeys.all, 'card-spending', cardId, since] as const,
}
