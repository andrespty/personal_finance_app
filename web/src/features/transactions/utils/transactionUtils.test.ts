import { describe, expect, it } from 'vitest'

import type { Account } from '@/features/accounts'
import type { Category } from '@/features/categories'

import type { Transaction } from '../types'

import { describeTransaction } from './describeTransaction'
import { entryTypeOf, signedCents } from './entryType'

describe('signedCents', () => {
  it('applies the sign rules', () => {
    expect(signedCents('charge', 500)).toBe(500)
    expect(signedCents('refund', 500)).toBe(-500)
    expect(signedCents('deposit', 500)).toBe(500)
    expect(signedCents('withdrawal', 500)).toBe(-500)
  })
})

describe('entryTypeOf', () => {
  it('reverses signedCents per account type', () => {
    expect(entryTypeOf(500, 'credit_card')).toBe('charge')
    expect(entryTypeOf(-500, 'credit_card')).toBe('refund')
    expect(entryTypeOf(500, 'savings')).toBe('deposit')
    expect(entryTypeOf(-500, 'checking')).toBe('withdrawal')
  })
})

const accounts = [
  { id: 'chk', name: 'General Checking', type: 'checking' },
  { id: 'vx', name: 'Venture X', type: 'credit_card' },
] as Account[]
const categories = [
  { id: 'shop', name: 'Shopping', parent_id: null },
  { id: 'clo', name: 'Clothing', parent_id: 'shop' },
] as Category[]

const tx = (fields: Partial<Transaction>) =>
  ({
    kind: 'regular',
    merchant: null,
    description: null,
    category_id: null,
    transfer: null,
    ...fields,
  }) as Transaction

describe('describeTransaction', () => {
  it('describes a card charge', () => {
    const d = describeTransaction(
      tx({ account_id: 'vx', amount_cents: 5412, merchant: 'Uniqlo', category_id: 'clo' }),
      accounts,
      categories,
    )
    expect(d).toEqual({
      title: 'Uniqlo',
      detail: 'Shopping › Clothing · Venture X',
      amount: '$54.12',
      tone: 'neutral',
    })
  })

  it('shows a deposit as positive', () => {
    const d = describeTransaction(
      tx({ account_id: 'chk', amount_cents: 240000 }),
      accounts,
      categories,
    )
    expect(d.title).toBe('Deposit')
    expect(d.amount).toBe('+$2,400.00')
    expect(d.tone).toBe('positive')
  })

  it('names both sides of a payment', () => {
    const transfer = { from_account_id: 'chk', to_account_id: 'vx' }
    const bankSide = describeTransaction(
      tx({ kind: 'payment', account_id: 'chk', amount_cents: -5000, transfer }),
      accounts,
      categories,
    )
    const cardSide = describeTransaction(
      tx({ kind: 'payment', account_id: 'vx', amount_cents: -5000, transfer }),
      accounts,
      categories,
    )
    expect(bankSide).toMatchObject({
      title: 'Payment to Venture X',
      amount: '−$50.00',
      tone: 'neutral',
    })
    expect(cardSide).toMatchObject({ title: 'Payment from General Checking', tone: 'positive' })
  })
})
