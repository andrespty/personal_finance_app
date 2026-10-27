import type { Tables } from '@/types/database'

export type Transaction = Tables<'transactions'> & {
  transfer: Pick<Tables<'transfers'>, 'from_account_id' | 'to_account_id'> | null
}

/** What a person picks in the form; the sign follows from it. */
export type EntryType = 'charge' | 'refund' | 'deposit' | 'withdrawal'

export type TransactionInput = {
  account_id: string
  amount_cents: number
  date: string
  category_id: string | null
  description: string | null
  merchant: string | null
}

export type TransactionFilters = { accountId?: string; limit?: number }
