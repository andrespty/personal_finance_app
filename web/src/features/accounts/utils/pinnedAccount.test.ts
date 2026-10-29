import { describe, expect, it } from 'vitest'

import type { Account } from '../types'

import { pinnedAccountOf } from './pinnedAccount'

const account = (id: string, type: Account['type']) => ({ id, type }) as Account
const savings = account('s', 'savings')
const checking = account('c', 'checking')

describe('pinnedAccountOf', () => {
  it('uses the pinned account', () => {
    expect(pinnedAccountOf([checking, savings], 's')).toBe(savings)
  })

  it('falls back to the first checking account', () => {
    expect(pinnedAccountOf([savings, checking], null)).toBe(checking)
    expect(pinnedAccountOf([savings, checking], 'archived-id')).toBe(checking)
  })

  it('falls back to the first account when there is no checking', () => {
    expect(pinnedAccountOf([savings], undefined)).toBe(savings)
    expect(pinnedAccountOf([], undefined)).toBeUndefined()
  })
})
