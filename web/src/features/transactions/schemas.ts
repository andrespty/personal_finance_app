import { z } from 'zod'

import { parseAmount } from '@/lib/money'

const isCard = (entry: string) => entry === 'charge' || entry === 'refund'

export const transactionFormSchema = z
  .object({
    entryType: z.enum(['charge', 'refund', 'deposit', 'withdrawal']),
    accountId: z.string().min(1, 'Choose an account.'),
    amount: z
      .string()
      .refine((v) => (parseAmount(v) ?? 0) > 0, 'Enter an amount.')
      .transform((v) => parseAmount(v) as number),
    categoryId: z.string(),
    text: z.string().trim().max(100, 'Keep it under 100 characters.'),
    date: z.iso.date('Choose a date.'),
  })
  .refine((v) => !isCard(v.entryType) || v.categoryId !== '', {
    path: ['categoryId'],
    message: 'Card transactions need a category.',
  })
  .refine((v) => !isCard(v.entryType) || v.text !== '', {
    path: ['text'],
    message: 'Enter the merchant.',
  })
