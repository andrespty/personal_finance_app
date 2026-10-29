import type { Enums, Tables } from '@/types/database'

export type AccountType = Enums<'account_type'>

/** An account with its current balance. For cards, balance = amount owed. */
export type Account = Tables<'accounts'> & { balanceCents: number }

export type AccountInput = {
  name: string
  type: AccountType
  alias: string | null
  wallet_name: string | null
  opening_balance_cents: number
  credit_limit_cents: number | null
  card_color: string | null
}
