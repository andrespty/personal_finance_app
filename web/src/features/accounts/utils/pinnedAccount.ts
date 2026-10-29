import type { Account } from '../types'

/**
 * The account shown big on the dashboard: the pinned one while it's still
 * open, otherwise the first checking account, otherwise the first account.
 */
export function pinnedAccountOf(
  bankAccounts: Account[],
  pinnedId: string | null | undefined,
): Account | undefined {
  return (
    bankAccounts.find((a) => a.id === pinnedId) ??
    bankAccounts.find((a) => a.type === 'checking') ??
    bankAccounts[0]
  )
}
