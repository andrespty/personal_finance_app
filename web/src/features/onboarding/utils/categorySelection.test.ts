import { describe, expect, it } from 'vitest'

import {
  addChild,
  addParent,
  countSelected,
  fromStarter,
  rename,
  toggleChild,
  toggleParent,
  toPayload,
} from './categorySelection'

const starter = [
  { name: 'Food', children: ['Groceries', 'Coffee'] },
  { name: 'Other', children: [] },
]

describe('category selection', () => {
  it('starts with everything selected', () => {
    expect(toPayload(fromStarter(starter))).toEqual([
      { name: 'Food', children: ['Groceries', 'Coffee'] },
      { name: 'Other', children: [] },
    ])
    expect(countSelected(fromStarter(starter))).toBe(4)
  })

  it('unticking a parent drops its subcategories', () => {
    const items = fromStarter(starter)
    expect(toPayload(toggleParent(items, items[0].key))).toEqual([{ name: 'Other', children: [] }])
  })

  it('ticking a subcategory ticks its parent', () => {
    let items = fromStarter(starter)
    items = toggleParent(items, items[0].key)
    items = toggleChild(items, items[0].key, items[0].children[1].key)
    expect(toPayload(items)).toEqual([
      { name: 'Food', children: ['Coffee'] },
      { name: 'Other', children: [] },
    ])
  })

  it('applies renames and additions, skipping blanks and duplicates', () => {
    let items = fromStarter(starter)
    items = rename(items, items[0].children[0].key, '  Supermarket ')
    const added = addParent(items)
    items = rename(added.items, added.key, 'Pets')
    const child = addChild(items, added.key)
    items = rename(child.items, child.key, 'Vet')
    items = addParent(items).items // left blank
    const dupe = addParent(items)
    items = rename(dupe.items, dupe.key, 'food')

    expect(toPayload(items)).toEqual([
      { name: 'Food', children: ['Supermarket', 'Coffee'] },
      { name: 'Other', children: [] },
      { name: 'Pets', children: ['Vet'] },
    ])
  })
})
