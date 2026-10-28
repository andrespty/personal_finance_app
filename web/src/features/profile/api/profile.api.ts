import { supabase } from '@/lib/supabase'

import type { Profile, ProfileUpdate } from '../types'

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, update: ProfileUpdate) {
  const { error } = await supabase.from('profiles').update(update).eq('user_id', userId)
  if (error) throw error
}
