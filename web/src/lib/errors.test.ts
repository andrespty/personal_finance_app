import { describe, expect, it } from 'vitest'

import { errorMessage } from './errors'

describe('errorMessage', () => {
  it('maps constraint errors to plain sentences', () => {
    expect(errorMessage({ code: '23505', message: 'duplicate key' })).toBe(
      'That name is already in use.',
    )
    expect(
      errorMessage({ code: '23514', message: 'new row for relation "accounts" violates…' }),
    ).toBe('Some values aren’t valid.')
  })

  it('passes through messages from our own database functions', () => {
    expect(
      errorMessage({ code: '23514', message: 'Credit card transactions need a category.' }),
    ).toBe('Credit card transactions need a category.')
  })

  it('falls back to a generic message', () => {
    expect(errorMessage(null)).toBe('Something went wrong. Try again.')
  })
})
