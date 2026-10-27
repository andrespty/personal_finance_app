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

/**
 * Parses what a person typed into an amount field. Returns null for empty or
 * invalid input instead of throwing.
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '')
  if (!/^\d*\.?\d{0,2}$/.test(cleaned) || cleaned === '' || cleaned === '.') return null
  return toCents(cleaned)
}

/** Cents → plain dollar string for prefilling inputs, e.g. 123456 → "1234.56". */
export function centsToInput(cents: number): string {
  return (Math.abs(cents) / 100).toFixed(2)
}

/** Formats cents as dollars, e.g. 123456 → "$1,234.56". */
export function formatCents(cents: number, options: { signed?: boolean } = {}): string {
  const text = formatter.format(Math.abs(cents) / 100)
  if (cents < 0) return `−${text}`
  if (options.signed && cents > 0) return `+${text}`
  return text
}
