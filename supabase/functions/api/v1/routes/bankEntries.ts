import { Hono } from 'hono'

import { reply } from '../../_shared/respond.ts'
import type { AppEnv } from '../../_shared/types.ts'
import { parseBody } from '../schemas/parse.ts'
import { bankEntrySchema } from '../schemas/transactions.ts'
import { addBankEntry } from '../services/transactions.ts'

/** POST /deposits and POST /withdrawals: same body, opposite sign. */
function bankEntryRoute(entry: 'deposit' | 'withdrawal') {
  return new Hono<AppEnv>().post('/', async (c) => {
    const input = await parseBody(c, bankEntrySchema)
    const { message, transaction } = await addBankEntry(c.get('db'), c.get('userId'), entry, input)
    return reply(c, message, { transaction }, 201)
  })
}

export const deposits = bankEntryRoute('deposit')
export const withdrawals = bankEntryRoute('withdrawal')
