import { describe, expect, it } from 'vitest'

import { formatDay, todayISO } from './dates'

const now = new Date(2026, 9, 27, 15, 0)

describe('todayISO', () => {
  it('uses local date parts', () => {
    expect(todayISO(now)).toBe('2026-10-27')
  })
})

describe('formatDay', () => {
  it('names today and yesterday', () => {
    expect(formatDay('2026-10-27', now)).toBe('Today')
    expect(formatDay('2026-10-26', now)).toBe('Yesterday')
  })

  it('omits the year for this year only', () => {
    expect(formatDay('2026-03-04', now)).toBe('Mar 4')
    expect(formatDay('2025-12-31', now)).toBe('Dec 31, 2025')
  })
})
