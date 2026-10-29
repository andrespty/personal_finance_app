import { z } from 'zod'

import { parseAmount } from '@/lib/money'

import type { AccountInput } from './types'
import { cardColorKeys } from './utils/cardColors'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))

const amount = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || parseAmount(v) !== null, message)
    .transform((v) => (v === '' ? null : parseAmount(v)))

/** Validates the account form's string fields and converts them for the database. */
export const accountFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name.').max(60, 'Keep it under 60 characters.'),
    type: z.enum(['checking', 'savings', 'credit_card']),
    alias: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]{0,30}$/, 'Use lowercase letters, numbers and dashes.')
      .transform((v) => (v === '' ? null : v)),
    walletName: optionalText(80),
    openingBalance: amount('Enter an amount like 1250.00.'),
    creditLimit: amount('Enter an amount like 5000.'),
    cardColor: z.enum(cardColorKeys),
  })
  .transform((v): AccountInput => ({
    name: v.name,
    type: v.type,
    alias: v.alias,
    wallet_name: v.type === 'credit_card' ? v.walletName : null,
    opening_balance_cents: v.type === 'credit_card' ? 0 : (v.openingBalance ?? 0),
    credit_limit_cents: v.type === 'credit_card' ? v.creditLimit : null,
    card_color: v.type === 'credit_card' ? v.cardColor : null,
  }))

export type AccountFormValues = z.input<typeof accountFormSchema>
