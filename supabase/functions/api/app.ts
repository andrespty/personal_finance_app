import { Hono } from 'hono'

import type { Db } from './_shared/db.ts'
import { toErrorResponse } from './_shared/errors.ts'
import { replyError } from './_shared/respond.ts'
import type { AppEnv } from './_shared/types.ts'
import { v1 } from './v1/index.ts'

/** The Shortcuts API. Supabase serves it at /functions/v1/api/... */
export function createApp(db: Db) {
  const app = new Hono<AppEnv>().basePath('/api')

  app.use('*', async (c, next) => {
    c.set('db', db)
    await next()
  })

  app.route('/v1', v1)
  // Later versions mount alongside, e.g. app.route('/v2', v2).

  app.notFound((c) => replyError(c, 'There’s no endpoint at this address.', 404))
  app.onError((error, c) => toErrorResponse(c, error))
  return app
}
