import type { SelectOption } from '@/components/ui'

import type { Category, CategoryNode } from '../types'

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)

/** Builds the two-level tree, sorted by name. */
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

/** Picker options: each parent followed by its subcategories. */
export function categoryOptions(categories: Category[]): SelectOption[] {
  return buildCategoryTree(categories).flatMap((parent) => [
    { value: parent.id, label: parent.name },
    ...parent.children.map((child) => ({
      value: child.id,
      label: `${parent.name} › ${child.name}`,
    })),
  ])
}
