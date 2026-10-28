const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/**
 * Parses a dollar amount from a Shortcut, which may send a number (12.5) or
 * text ("12.50", "$1,204.30"). Returns positive cents, or null if invalid.
 */
export function parseDollars(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null
  }
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[$,\s]/g, '')
  if (!/^\d*\.?\d{0,2}$/.test(cleaned) || cleaned === '' || cleaned === '.') return null
  const cents = Math.round(Number(cleaned) * 100)
  return cents > 0 ? cents : null
}

export function formatCents(cents: number): string {
  const text = formatter.format(Math.abs(cents) / 100)
  return cents < 0 ? `−${text}` : text
}
