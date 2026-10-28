import type { Category, CategoryNode } from '../types'

/** "Other" / "Others" is the catch-all, so it always sorts last. */
const isOther = (name: string) => /^others?$/i.test(name.trim())

const byName = (a: Category, b: Category) =>
  Number(isOther(a.name)) - Number(isOther(b.name)) || a.name.localeCompare(b.name)

/** Builds the two-level tree, sorted by name with "Other" last. */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const parents = categories.filter((c) => c.parent_id === null).sort(byName)
  return parents.map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parent_id === parent.id).sort(byName),
  }))
}

/** "Shopping" or "Shopping › Clothing". */
export function categoryLabel(category: Category, all: Category[]): string {
  if (!category.parent_id) return category.name
  const parent = all.find((c) => c.id === category.parent_id)
  return parent ? `${parent.name} › ${category.name}` : category.name
}
