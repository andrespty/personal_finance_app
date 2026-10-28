import { describe, expect, it } from 'vitest'

import type { CategoryNode } from '@/features/categories'

import { isPicked, toggleChild, toggleParent } from './chipSelection'

const food = {
  id: 'food',
  parent_id: null,
  children: [
    { id: 'groceries', parent_id: 'food' },
    { id: 'coffee', parent_id: 'food' },
  ],
} as CategoryNode

describe('toggleParent', () => {
  it('picks the whole group, replacing any picked subcategories', () => {
    expect(toggleParent(['coffee', 'gas'], food)).toEqual(['gas', 'food'])
  })

  it('clears the whole group when already picked', () => {
    expect(toggleParent(['food', 'gas'], food)).toEqual(['gas'])
  })
})

describe('toggleChild', () => {
  it('picks and clears a single subcategory', () => {
    expect(toggleChild([], food, 'coffee')).toEqual(['coffee'])
    expect(toggleChild(['coffee'], food, 'coffee')).toEqual([])
  })

  it('unpicking one subcategory of a picked group keeps the others', () => {
    expect(toggleChild(['food'], food, 'coffee')).toEqual(['groceries'])
  })

  it('picking the last subcategory collapses into the parent', () => {
    expect(toggleChild(['groceries'], food, 'coffee')).toEqual(['food'])
  })
})

describe('isPicked', () => {
  it('counts subcategories of a picked parent', () => {
    expect(isPicked(['food'], 'coffee', 'food')).toBe(true)
    expect(isPicked(['groceries'], 'coffee', 'food')).toBe(false)
  })
})
