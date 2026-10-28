import { Hono } from 'hono'

import { reply } from '../../_shared/respond.ts'
import type { AppEnv } from '../../_shared/types.ts'
import { parseBody } from '../schemas/parse.ts'
import { transferSchema } from '../schemas/transfers.ts'
import { createTransfer } from '../services/transfers.ts'

export const transfers = new Hono<AppEnv>().post('/', async (c) => {
  const input = await parseBody(c, transferSchema)
  const { message, transfer } = await createTransfer(c.get('db'), c.get('userId'), input)
  return reply(c, message, { transfer }, 201)
})
