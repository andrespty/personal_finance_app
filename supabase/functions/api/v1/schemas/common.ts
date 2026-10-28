import { z } from 'zod'

import { parseDollars } from '../../_shared/money.ts'

/** A positive dollar amount, as a number or text. Becomes cents. */
export const amount = z.unknown().transform((value, ctx) => {
  const cents = parseDollars(value)
  if (cents === null) {
    ctx.addIssue({
      code: 'custom',
      message: 'amount must be a positive dollar amount, like 12.50.',
    })
    return z.NEVER
  }
  return cents
})

/** Required text that names something, e.g. an account. */
export const reference = (field: string) =>
  z.string({ error: `${field} is required.` }).trim().min(1, `${field} is required.`)

export const optionalText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${field} must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => v || undefined)

/** YYYY-MM-DD, or a full ISO date-time (its date part is used). Defaults to today. */
export const date = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return undefined
    const day = v.slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) {
      ctx.addIssue({ code: 'custom', message: 'date must look like 2026-10-28.' })
      return z.NEVER
    }
    return day
  })

/** Lowercases text so "Charge" from a Shortcut menu still matches. */
export const lowercaseEnum = <T extends string>(values: readonly [T, ...T[]], message: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.enum(values, { error: message }),
  )
