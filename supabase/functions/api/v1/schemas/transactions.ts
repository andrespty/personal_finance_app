import { z } from 'zod'

import { amount, date, lowercaseEnum, optionalText, reference } from './common.ts'

export const cardTransactionSchema = z.object({
  card: reference('card'),
  type: lowercaseEnum(['charge', 'refund'], 'type must be "charge" or "refund".').default('charge'),
  amount,
  category: reference('category'),
  description: optionalText('description', 200),
  merchant: optionalText('merchant', 100),
  date,
})

/** Deposits and withdrawals share a shape; the endpoint decides the sign. */
export const bankEntrySchema = z.object({
  account: reference('account'),
  amount,
  category: optionalText('category', 100),
  description: optionalText('description', 200),
  date,
})

export type CardTransactionInput = z.infer<typeof cardTransactionSchema>
export type BankEntryInput = z.infer<typeof bankEntrySchema>
