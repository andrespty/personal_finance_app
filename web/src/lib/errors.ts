type PostgresLikeError = { code?: string; message?: string }

const GENERIC = 'Something went wrong. Try again.'

/**
 * Turns Supabase/Postgres errors into a sentence a person can act on.
 * Messages raised by our own database functions are already written for
 * people, so they pass through.
 */
export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const { code, message } = error as PostgresLikeError
    switch (code) {
      case '23505':
        return 'That name is already in use.'
      case '23503':
        return 'It’s still used elsewhere, so it can’t be removed.'
      case '23514':
      case 'P0002':
        return message && !message.startsWith('new row') ? message : 'Some values aren’t valid.'
      case '42501':
        return 'You don’t have access to do that.'
    }
    if (message) return message
  }
  return GENERIC
}
