import { describe, expect, it } from 'vitest'

import type { Account } from '@/features/accounts'
import type { Category } from '@/features/categories'

import { groupSpending, monthStart, payerColor, payerRows, percentOf } from './shares'

const accounts = [
  { id: 'general', name: 'General Checking' },
  { id: 'fun', name: 'Fun Checking' },
  { id: 'savings', name: 'Savings' },
] as Account[]
const categories = [
  { id: 'shop', name: 'Shopping', parent_id: null },
  { id: 'clothing', name: 'Clothing', parent_id: 'shop' },
  { id: 'food', name: 'Food', parent_id: null },
  { id: 'groceries', name: 'Groceries', parent_id: 'food' },
  { id: 'coffee', name: 'Coffee', parent_id: 'food' },
] as Category[]

const setup = {
  cardId: 'vx',
  defaultPayerId: 'general',
  rules: [{ payerAccountId: 'fun', categoryIds: ['clothing', 'food'] }],
}

describe('payerRows', () => {
  it('lists category payers first and "everything else" last', () => {
    const rows = payerRows(
      setup,
      [
        { cardId: 'vx', payerAccountId: 'general', shareCents: 30000 },
        { cardId: 'vx', payerAccountId: 'fun', shareCents: 8200 },
        { cardId: 'vx', payerAccountId: 'savings', shareCents: -5000 },
        { cardId: 'other', payerAccountId: 'general', shareCents: 999 },
      ],
      accounts,
      categories,
    )
    expect(rows.map((r) => [r.name, r.detail, r.shareCents, r.color])).toEqual([
      ['Fun Checking', 'Clothing, Food', 8200, 'var(--payer-2)'],
      ['Savings', 'Not a payer for this card', -5000, 'var(--muted)'],
      ['General Checking', 'Everything else', 30000, 'var(--payer-1)'],
    ])
  })

  it('says "Everything" when there are no category payers', () => {
    const rows = payerRows(
      { cardId: 'vx', defaultPayerId: 'general', rules: [] },
      [],
      accounts,
      categories,
    )
    expect(rows.map((r) => r.detail)).toEqual(['Everything'])
  })
})

describe('payerColor', () => {
  it('keeps colors stable per payer', () => {
    expect(payerColor(setup, 'general')).toBe('var(--payer-1)')
    expect(payerColor(setup, 'fun')).toBe('var(--payer-2)')
    expect(payerColor(setup, 'savings')).toBe('var(--muted)')
  })
})

describe('percentOf', () => {
  it('rounds and ignores non-positive amounts', () => {
    expect(percentOf(30000, 38200)).toBe(79)
    expect(percentOf(-5000, 38200)).toBeNull()
  })
})

describe('groupSpending', () => {
  it('groups by parent, largest first, with subcategories underneath', () => {
    const groups = groupSpending(
      [
        { cardId: 'vx', categoryId: 'groceries', payerAccountId: 'fun', amountCents: 19000 },
        { cardId: 'vx', categoryId: 'coffee', payerAccountId: 'fun', amountCents: 6000 },
        { cardId: 'vx', categoryId: 'clothing', payerAccountId: 'fun', amountCents: 8200 },
        { cardId: 'vx', categoryId: 'food', payerAccountId: 'fun', amountCents: 1500 },
        { cardId: 'vx', categoryId: 'clothing', payerAccountId: 'fun', amountCents: -2000 },
      ],
      categories,
    )
    expect(groups.map((g) => [g.name, g.cents, g.lines.map((l) => [l.name, l.cents])])).toEqual([
      [
        'Food',
        26500,
        [
          ['Groceries', 19000],
          ['Coffee', 6000],
          ['No subcategory', 1500],
        ],
      ],
      ['Shopping', 6200, [['Clothing', 6200]]],
    ])
  })
})

describe('monthStart', () => {
  it('returns the first of the month', () => {
    expect(monthStart(new Date(2026, 9, 27))).toBe('2026-10-01')
  })
})
