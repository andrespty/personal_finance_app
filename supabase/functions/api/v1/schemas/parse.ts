import type { Context } from 'hono'
import type { z } from 'zod'

import { ApiError } from '../../_shared/errors.ts'

/** Reads and validates a JSON body, turning the first problem into a 400. */
export async function parseBody<S extends z.ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    throw new ApiError(400, 'Send the request body as JSON.')
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message ?? 'The request body isn’t valid.')
  }
  return result.data
}
