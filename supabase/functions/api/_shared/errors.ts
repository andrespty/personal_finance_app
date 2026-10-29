import type { Context } from 'hono'

import { DbCallError } from './db.ts'
import { replyError } from './respond.ts'

type ErrorStatus = 400 | 401 | 403 | 404 | 500

/** An error whose message is safe and useful to show in a Shortcut. */
export class ApiError extends Error {
  constructor(readonly status: ErrorStatus, message: string) {
    super(message)
  }
}

// Messages raised by our database functions are written for people.
const statusForDbCode: Record<string, ErrorStatus> = {
  P0002: 404, // not found
  '23514': 400, // a rule was broken
  '22023': 400, // bad input
  '42501': 403,
}

export function toErrorResponse(c: Context, error: unknown) {
  let status: ErrorStatus = 500
  let message = 'Something went wrong. Try again in a moment.'

  if (error instanceof ApiError) {
    status = error.status
    message = error.message
  } else if (error instanceof DbCallError && error.code && statusForDbCode[error.code]) {
    status = statusForDbCode[error.code]
    message = error.message
  } else {
    console.error(error)
  }

  return replyError(c, message, status)
}
