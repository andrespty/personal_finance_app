/**
 * Money is stored as integer cents everywhere. These helpers are the only
 * place dollars and cents are converted.
 */

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Parses a dollar amount ("12.5", "$1,204.30", 12.5) into integer cents. */
export function toCents(dollars: string | number): number {
  const value = typeof dollars === 'number' ? dollars : Number(dollars.replace(/[$,\s]/g, ''))
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid amount: ${dollars}`)
  }
  return Math.round(value * 100)
}

/** Formats cents as dollars, e.g. 123456 → "$1,234.56". */
export function formatCents(cents: number, options: { signed?: boolean } = {}): string {
  const text = formatter.format(Math.abs(cents) / 100)
  if (cents < 0) return `−${text}`
  if (options.signed && cents > 0) return `+${text}`
  return text
}
