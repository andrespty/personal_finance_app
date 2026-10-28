import { Hono } from 'hono'

import { reply } from '../../_shared/respond.ts'
import type { AppEnv } from '../../_shared/types.ts'
import { getMoneyLeft } from '../services/moneyLeft.ts'

export const moneyLeft = new Hono<AppEnv>().get('/', async (c) => {
  const { message, ...data } = await getMoneyLeft(
    c.get('db'),
    c.get('userId'),
    c.req.query('account'),
  )
  return reply(c, message, data)
})
