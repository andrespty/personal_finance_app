import { describe, expect, it } from 'vitest'

import { formatCents, toCents } from './money'

describe('toCents', () => {
  it('parses numbers and strings', () => {
    expect(toCents(12.5)).toBe(1250)
    expect(toCents('12.50')).toBe(1250)
    expect(toCents('$1,204.30')).toBe(120430)
  })

  it('rounds float noise', () => {
    expect(toCents(0.1 + 0.2)).toBe(30)
    expect(toCents('19.999')).toBe(2000)
  })

  it('rejects invalid input', () => {
    expect(() => toCents('abc')).toThrow()
  })
})

describe('formatCents', () => {
  it('formats positive, negative and signed values', () => {
    expect(formatCents(123456)).toBe('$1,234.56')
    expect(formatCents(-5412)).toBe('−$54.12')
    expect(formatCents(240000, { signed: true })).toBe('+$2,400.00')
    expect(formatCents(0, { signed: true })).toBe('$0.00')
  })
})
