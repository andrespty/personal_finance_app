import { z } from 'zod'

import { amount, date, optionalText, reference } from './common.ts'

export const transferSchema = z.object({
  from: reference('from'),
  to: reference('to'),
  amount,
  date,
  note: optionalText('note', 200),
})

export type TransferInput = z.infer<typeof transferSchema>
