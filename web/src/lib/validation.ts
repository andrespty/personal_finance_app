import type { z } from 'zod'

/** First error message per form field, keyed by the field's input name. */
export function fieldErrors<Field extends string>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '') as Field
    errors[field] ??= issue.message
  }
  return errors
}
