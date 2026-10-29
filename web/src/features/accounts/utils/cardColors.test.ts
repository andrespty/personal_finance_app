import { describe, expect, it } from 'vitest'

import { cardColorOf } from './cardColors'

describe('cardColorOf', () => {
  it('keeps known colors and defaults the rest to forest', () => {
    expect(cardColorOf('copper')).toBe('copper')
    expect(cardColorOf(null)).toBe('forest')
    expect(cardColorOf('tangerine')).toBe('forest')
  })
})
