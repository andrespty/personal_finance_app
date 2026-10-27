import type { Tables } from '@/types/database'

export type Category = Tables<'categories'>

/** A top-level category with its subcategories. */
export type CategoryNode = Category & { children: Category[] }

export type CategoryInput = { name: string; parent_id: string | null }
