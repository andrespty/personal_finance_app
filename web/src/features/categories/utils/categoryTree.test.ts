import { describe, expect, it } from 'vitest'

import type { Category } from '../types'

import { buildCategoryTree, categoryLabel } from './categoryTree'

const cat = (id: string, name: string, parent_id: string | null = null) =>
  ({ id, name, parent_id }) as Category

const all = [
  cat('s', 'Shopping'),
  cat('f', 'Food'),
  cat('c', 'Clothing', 's'),
  cat('h', 'Home', 's'),
  cat('g', 'Groceries', 'f'),
]

describe('buildCategoryTree', () => {
  it('nests subcategories under parents, sorted by name', () => {
    const tree = buildCategoryTree(all)
    expect(tree.map((n) => n.name)).toEqual(['Food', 'Shopping'])
    expect(tree[1].children.map((c) => c.name)).toEqual(['Clothing', 'Home'])
  })
})

describe('categoryLabel', () => {
  it('includes the parent for subcategories', () => {
    expect(categoryLabel(all[2], all)).toBe('Shopping › Clothing')
    expect(categoryLabel(all[0], all)).toBe('Shopping')
  })
})
