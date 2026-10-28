import { supabase } from '@/lib/supabase'

export type Credentials = { email: string; password: string }

export async function signIn({ email, password }: Credentials) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Returns true when the account still needs its email confirmed. */
export async function signUp({
  email,
  password,
}: Credentials): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
  return { needsConfirmation: !data.session }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
