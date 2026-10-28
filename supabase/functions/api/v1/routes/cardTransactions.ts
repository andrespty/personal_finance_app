import { Hono } from 'hono'

import { reply } from '../../_shared/respond.ts'
import type { AppEnv } from '../../_shared/types.ts'
import { parseBody } from '../schemas/parse.ts'
import { cardTransactionSchema } from '../schemas/transactions.ts'
import { addCardTransaction } from '../services/transactions.ts'

export const cardTransactions = new Hono<AppEnv>().post('/', async (c) => {
  const input = await parseBody(c, cardTransactionSchema)
  const { message, transaction } = await addCardTransaction(c.get('db'), c.get('userId'), input)
  return reply(c, message, { transaction }, 201)
})
