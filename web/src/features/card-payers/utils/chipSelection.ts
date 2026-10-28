import type { CategoryNode } from '@/features/categories'

/**
 * Category picks for one payer. Picking a parent stores just the parent
 * (it covers every subcategory, including ones added later); picking every
 * subcategory one by one collapses into the parent.
 */

/** Whether a category is covered by the picks, directly or through its parent. */
export function isPicked(picked: string[], categoryId: string, parentId: string | null): boolean {
  return picked.includes(categoryId) || (parentId !== null && picked.includes(parentId))
}

/** Tapping a parent picks the whole group, or clears it if it's already picked. */
export function toggleParent(picked: string[], group: CategoryNode): string[] {
  const childIds = group.children.map((c) => c.id)
  const withoutGroup = picked.filter((id) => id !== group.id && !childIds.includes(id))
  return picked.includes(group.id) ? withoutGroup : [...withoutGroup, group.id]
}

/** Tapping a subcategory picks or clears just that one. */
export function toggleChild(picked: string[], group: CategoryNode, childId: string): string[] {
  const childIds = group.children.map((c) => c.id)
  // The whole group was picked: keep every subcategory except this one.
  if (picked.includes(group.id)) {
    return [...picked.filter((id) => id !== group.id), ...childIds.filter((id) => id !== childId)]
  }
  if (picked.includes(childId)) return picked.filter((id) => id !== childId)

  const next = [...picked, childId]
  const allPicked = childIds.every((id) => next.includes(id))
  return allPicked ? [...next.filter((id) => !childIds.includes(id)), group.id] : next
}
