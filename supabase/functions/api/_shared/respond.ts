import type { Context } from 'hono'

/** Shortcuts can ask for a plain sentence with ?format=text, e.g. for Siri to read. */
export function wantsText(c: Context): boolean {
  return c.req.query('format') === 'text'
}

/**
 * Replies with JSON ({ success: true, message, ...data }), or just the
 * message as text.
 */
export function reply(
  c: Context,
  message: string,
  data: Record<string, unknown> = {},
  status: 200 | 201 = 200,
) {
  return wantsText(c)
    ? c.text(message, status)
    : c.json({ success: true, message, ...data }, status)
}

/**
 * Replies to a failed request with JSON ({ success: false, message, error }),
 * or just the message as text. `error` repeats the message for older Shortcuts.
 */
export function replyError(c: Context, message: string, status: 400 | 401 | 403 | 404 | 500) {
  return wantsText(c)
    ? c.text(message, status)
    : c.json({ success: false, message, error: message }, status)
}
