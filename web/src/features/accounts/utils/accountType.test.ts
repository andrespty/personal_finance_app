import { describe, expect, it } from 'vitest'

import type { Account } from '../types'

import { groupAccounts } from './accountType'

const account = (id: string, type: Account['type']) => ({ id, type }) as Account

describe('groupAccounts', () => {
  it('orders groups checking → savings → cards and skips empty ones', () => {
    const groups = groupAccounts([account('1', 'credit_card'), account('2', 'checking')])
    expect(groups.map((g) => g.type)).toEqual(['checking', 'credit_card'])
  })
})
