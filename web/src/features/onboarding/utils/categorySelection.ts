import type { StarterCategory } from '../data/starterCategories'

export type SelectionChild = { key: string; name: string; checked: boolean }
export type SelectionItem = SelectionChild & { children: SelectionChild[] }

let nextKey = 0
const newKey = () => `c${++nextKey}`

/** Everything starts checked; people untick what they don't want. */
export function fromStarter(starter: StarterCategory[]): SelectionItem[] {
  return starter.map((parent) => ({
    key: newKey(),
    name: parent.name,
    checked: true,
    children: parent.children.map((name) => ({ key: newKey(), name, checked: true })),
  }))
}

/** Ticking or unticking a parent does the same to its subcategories. */
export function toggleParent(items: SelectionItem[], key: string): SelectionItem[] {
  return items.map((item) => {
    if (item.key !== key) return item
    const checked = !item.checked
    return { ...item, checked, children: item.children.map((c) => ({ ...c, checked })) }
  })
}

/** A ticked subcategory needs its parent, so ticking one ticks the parent. */
export function toggleChild(
  items: SelectionItem[],
  parentKey: string,
  childKey: string,
): SelectionItem[] {
  return items.map((item) => {
    if (item.key !== parentKey) return item
    const children = item.children.map((c) =>
      c.key === childKey ? { ...c, checked: !c.checked } : c,
    )
    const childNowChecked = children.find((c) => c.key === childKey)?.checked
    return { ...item, checked: item.checked || Boolean(childNowChecked), children }
  })
}

export function rename(items: SelectionItem[], key: string, name: string): SelectionItem[] {
  return items.map((item) =>
    item.key === key
      ? { ...item, name }
      : { ...item, children: item.children.map((c) => (c.key === key ? { ...c, name } : c)) },
  )
}

export function addParent(items: SelectionItem[]): { items: SelectionItem[]; key: string } {
  const key = newKey()
  return { items: [...items, { key, name: '', checked: true, children: [] }], key }
}

export function addChild(
  items: SelectionItem[],
  parentKey: string,
): { items: SelectionItem[]; key: string } {
  const key = newKey()
  return {
    items: items.map((item) =>
      item.key === parentKey
        ? { ...item, checked: true, children: [...item.children, { key, name: '', checked: true }] }
        : item,
    ),
    key,
  }
}

export type CategoryPayload = { name: string; children: string[] }[]

const clean = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 40)

/** Only ticked, named categories, without duplicate names. Ready for add_categories. */
export function toPayload(items: SelectionItem[]): CategoryPayload {
  const seenParents = new Set<string>()
  const payload: CategoryPayload = []
  for (const item of items) {
    const name = clean(item.name)
    if (!item.checked || !name || seenParents.has(name.toLowerCase())) continue
    seenParents.add(name.toLowerCase())

    const seenChildren = new Set<string>()
    const children: string[] = []
    for (const child of item.children) {
      const childName = clean(child.name)
      if (!child.checked || !childName || seenChildren.has(childName.toLowerCase())) continue
      seenChildren.add(childName.toLowerCase())
      children.push(childName)
    }
    payload.push({ name, children })
  }
  return payload
}

export function countSelected(items: SelectionItem[]): number {
  return toPayload(items).reduce((sum, parent) => sum + 1 + parent.children.length, 0)
}
