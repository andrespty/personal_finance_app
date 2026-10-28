import { describe, expect, it } from 'vitest'

import { cleanRules, duplicateCategories, isConfigured, toSetups } from './payerSetup'

describe('toSetups', () => {
  it('groups payers and their categories by card', () => {
    const setups = toSetups(
      [
        { id: 'p1', card_id: 'vx', payer_account_id: 'general', is_default: true },
        { id: 'p2', card_id: 'vx', payer_account_id: 'fun', is_default: false },
      ],
      [
        { card_payer_id: 'p2', category_id: 'clothing' },
        { card_payer_id: 'p2', category_id: 'gaming' },
      ],
    )
    expect(setups).toEqual([
      {
        cardId: 'vx',
        defaultPayerId: 'general',
        rules: [{ payerAccountId: 'fun', categoryIds: ['clothing', 'gaming'] }],
      },
    ])
    expect(isConfigured(setups[0])).toBe(true)
  })
})

describe('cleanRules', () => {
  it('drops empty rules and merges rules for the same payer', () => {
    expect(
      cleanRules([
        { payerAccountId: 'fun', categoryIds: ['clothing'] },
        { payerAccountId: '', categoryIds: ['x'] },
        { payerAccountId: 'general', categoryIds: [] },
        { payerAccountId: 'fun', categoryIds: ['gaming', 'clothing'] },
      ]),
    ).toEqual([{ payerAccountId: 'fun', categoryIds: ['clothing', 'gaming'] }])
  })
})

describe('duplicateCategories', () => {
  it('finds categories claimed by two different payers', () => {
    expect(
      duplicateCategories([
        { payerAccountId: 'fun', categoryIds: ['clothing'] },
        { payerAccountId: 'general', categoryIds: ['clothing', 'rent'] },
      ]),
    ).toEqual(['clothing'])
  })
})
