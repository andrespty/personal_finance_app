import type { Account, AccountType } from '../types'

export const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit card',
}

export const accountGroupTitles: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit cards',
}

export const accountTypeOrder: AccountType[] = ['checking', 'savings', 'credit_card']

export function isCard(account: Pick<Account, 'type'>): boolean {
  return account.type === 'credit_card'
}

/** Groups accounts by type, in display order, skipping empty groups. */
export function groupAccounts(accounts: Account[]): { type: AccountType; accounts: Account[] }[] {
  return accountTypeOrder
    .map((type) => ({ type, accounts: accounts.filter((a) => a.type === type) }))
    .filter((group) => group.accounts.length > 0)
}
