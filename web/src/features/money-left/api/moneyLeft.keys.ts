import { accountKeys } from '@/features/accounts'

// Nested under accounts so anything that refreshes balances refreshes this too.
export const moneyLeftKeys = {
  all: [...accountKeys.all, 'money-left'] as const,
}
