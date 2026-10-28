import { createClient } from '@supabase/supabase-js'

/** The API only calls database functions; this keeps tests free of Supabase. */
export type Db = {
  rpc<T>(fn: string, args: Record<string, unknown>): Promise<T>
}

export type DbError = { code?: string; message: string }

export class DbCallError extends Error {
  constructor(readonly code: string | undefined, message: string) {
    super(message)
  }
}

/**
 * Service-role client. The API functions it calls are only executable by
 * service_role and scope everything to the user id they're given.
 */
export function createServiceDb(): Db {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')

  const client = createClient(url, key, { auth: { persistSession: false } })
  return {
    async rpc<T>(fn: string, args: Record<string, unknown>) {
      const { data, error } = await client.rpc(fn, args)
      if (error) throw new DbCallError(error.code, error.message)
      return data as T
    },
  }
}
