import { Hono } from 'hono'

import { reply } from '../../_shared/respond.ts'
import type { AppEnv } from '../../_shared/types.ts'
import { getInfo } from '../services/info.ts'

export const info = new Hono<AppEnv>().get('/', async (c) => {
  const { message, ...data } = await getInfo(c.get('db'), c.get('userId'))
  return reply(c, message, data)
})
