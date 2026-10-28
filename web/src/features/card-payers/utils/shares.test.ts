import { describe, expect, it } from 'vitest'

import type { Account } from '@/features/accounts'
import type { Category } from '@/features/categories'

import { cardSplit, monthStart, payerRows, spendingByCategory } from './shares'

const accounts = [
  { id: 'general', name: 'General Checking' },
  { id: 'fun', name: 'Fun Checking' },
  { id: 'savings', name: 'Savings' },
] as Account[]
const categories = [
  { id: 'shop', name: 'Shopping', parent_id: null },
  { id: 'clothing', name: 'Clothing', parent_id: 'shop' },
  { id: 'gaming', name: 'Gaming', parent_id: null },
] as Category[]

const setup = {
  cardId: 'vx',
  defaultPayerId: 'general',
  rules: [{ payerAccountId: 'fun', categoryIds: ['clothing', 'gaming'] }],
}

describe('payerRows', () => {
  it('lists the default, rule payers, other payers and the uncovered part', () => {
    const rows = payerRows(
      setup,
      [
        { cardId: 'vx', payerAccountId: 'general', shareCents: 107440 },
        { cardId: 'vx', payerAccountId: 'fun', shareCents: 21200 },
        { cardId: 'vx', payerAccountId: 'savings', shareCents: -5000 },
        { cardId: 'vx', payerAccountId: null, shareCents: 1000 },
        { cardId: 'other', payerAccountId: 'general', shareCents: 999 },
      ],
      accounts,
      categories,
    )
    expect(rows.map((r) => [r.name, r.detail, r.shareCents])).toEqual([
      ['General Checking', 'Everything else', 107440],
      ['Fun Checking', 'Clothing, Gaming', 21200],
      ['Savings', 'Not a payer for this card', -5000],
      ['No one', 'Not covered by any account', 1000],
    ])
  })
})

describe('cardSplit', () => {
  it('keeps positive shares, largest first, with short names', () => {
    expect(
      cardSplit(
        'vx',
        [
          { cardId: 'vx', payerAccountId: 'fun', shareCents: 21200 },
          { cardId: 'vx', payerAccountId: 'general', shareCents: 107440 },
          { cardId: 'vx', payerAccountId: 'savings', shareCents: -100 },
        ],
        accounts,
      ),
    ).toEqual([
      { label: 'General', cents: 107440 },
      { label: 'Fun', cents: 21200 },
    ])
  })
})

describe('spendingByCategory', () => {
  it('groups by category with the payer, largest first', () => {
    expect(
      spendingByCategory(
        [
          { cardId: 'vx', categoryId: 'clothing', payerAccountId: 'fun', amountCents: 5000 },
          { cardId: 'vx', categoryId: 'gaming', payerAccountId: 'fun', amountCents: 9000 },
          { cardId: 'vx', categoryId: 'clothing', payerAccountId: 'fun', amountCents: -1000 },
        ],
        accounts,
        categories,
      ),
    ).toEqual([
      { categoryId: 'gaming', label: 'Gaming', payerName: 'Fun Checking', cents: 9000 },
      {
        categoryId: 'clothing',
        label: 'Shopping › Clothing',
        payerName: 'Fun Checking',
        cents: 4000,
      },
    ])
  })
})

describe('monthStart', () => {
  it('returns the first of the month', () => {
    expect(monthStart(new Date(2026, 9, 27))).toBe('2026-10-01')
  })
})
