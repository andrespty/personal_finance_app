import { supabase } from '@/lib/supabase'

import type { Category, CategoryInput } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCategory(input: CategoryInput) {
  const { error } = await supabase.from('categories').insert(input)
  if (error) throw error
}

export async function updateCategory(id: string, input: CategoryInput) {
  const { error } = await supabase.from('categories').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
