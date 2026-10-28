import { supabase } from '@/lib/supabase'

import type { ApiToken } from '../types'

/** Active tokens. The token itself is never stored, only its first characters. */
export async function fetchApiTokens(): Promise<ApiToken[]> {
  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, name, token_prefix, created_at, last_used_at')
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Returns the new token. This is the only time it can be read. */
export async function createApiToken(name: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_api_token', { name })
  if (error) throw error
  return data
}

export async function revokeApiToken(id: string) {
  const { error } = await supabase.rpc('revoke_api_token', { token_id: id })
  if (error) throw error
}
