import type { Context } from 'hono'

/** Shortcuts can ask for a plain sentence with ?format=text, e.g. for Siri to read. */
export function wantsText(c: Context): boolean {
  return c.req.query('format') === 'text'
}

/** Replies with JSON (message + data), or just the message as text. */
export function reply(
  c: Context,
  message: string,
  data: Record<string, unknown> = {},
  status: 200 | 201 = 200,
) {
  return wantsText(c) ? c.text(message, status) : c.json({ message, ...data }, status)
}
