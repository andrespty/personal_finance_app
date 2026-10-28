import { createMiddleware } from 'hono/factory'

import { ApiError } from './errors.ts'
import type { AppEnv } from './types.ts'

/** Accepts `Authorization: Bearer pfa_…` and remembers whose token it is. */
export const requireToken = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const token = header.match(/^Bearer\s+(pfa_[0-9a-f]+)\s*$/i)?.[1]
  if (!token) {
    throw new ApiError(
      401,
      'Add your API token as "Authorization: Bearer pfa_…". Create one in Settings → API tokens.',
    )
  }
  const userId = await c.get('db').rpc<string | null>('api_user_for_token', { token })
  if (!userId) throw new ApiError(401, 'This API token isn’t valid. It may have been revoked.')
  c.set('userId', userId)
  await next()
})
