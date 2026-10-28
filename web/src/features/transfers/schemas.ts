import { z } from 'zod'

import { parseAmount } from '@/lib/money'

export const transferFormSchema = z
  .object({
    fromAccountId: z.string().min(1, 'Choose where the money comes from.'),
    toAccountId: z.string().min(1, 'Choose where it goes.'),
    amount: z
      .string()
      .refine((v) => (parseAmount(v) ?? 0) > 0, 'Enter an amount.')
      .transform((v) => parseAmount(v) as number),
    date: z.iso.date('Choose a date.'),
    note: z
      .string()
      .trim()
      .max(200, 'Keep it under 200 characters.')
      .transform((v) => (v === '' ? null : v)),
  })
  .refine((v) => v.fromAccountId !== v.toAccountId, {
    path: ['toAccountId'],
    message: 'Pick two different accounts.',
  })
