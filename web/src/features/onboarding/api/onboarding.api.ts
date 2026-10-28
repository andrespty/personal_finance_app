import { supabase } from '@/lib/supabase'

import type { CategoryPayload } from '../utils/categorySelection'

/** Creates the chosen categories in one call. Safe to retry. */
export async function addCategories(categories: CategoryPayload) {
  const { error } = await supabase.rpc('add_categories', { categories })
  if (error) throw error
}
