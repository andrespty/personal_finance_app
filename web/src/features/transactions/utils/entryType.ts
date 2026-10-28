import type { AccountType } from '@/features/accounts'

import type { EntryType } from '../types'

export const entryTypeLabels: Record<EntryType, string> = {
  charge: 'Charge',
  refund: 'Refund',
  deposit: 'Deposit',
  withdrawal: 'Withdraw',
}

export const cardEntryTypes: EntryType[] = ['charge', 'refund']
export const bankEntryTypes: EntryType[] = ['deposit', 'withdrawal']

export function isCardEntry(entry: EntryType): boolean {
  return entry === 'charge' || entry === 'refund'
}

/**
 * Applies the sign rules to a positive amount:
 * card charge +, card refund −, deposit +, withdrawal −.
 */
export function signedCents(entry: EntryType, cents: number): number {
  const magnitude = Math.abs(cents)
  return entry === 'charge' || entry === 'deposit' ? magnitude : -magnitude
}

/** The reverse of signedCents, for editing an existing transaction. */
export function entryTypeOf(amountCents: number, accountType: AccountType): EntryType {
  if (accountType === 'credit_card') return amountCents >= 0 ? 'charge' : 'refund'
  return amountCents >= 0 ? 'deposit' : 'withdrawal'
}
