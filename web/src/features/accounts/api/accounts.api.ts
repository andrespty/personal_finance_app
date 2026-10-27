import { supabase } from '@/lib/supabase'

import type { Account, AccountInput } from '../types'

export async function fetchAccounts(): Promise<Account[]> {
  const [accounts, balances] = await Promise.all([
    supabase.from('accounts').select('*').order('created_at'),
    supabase.from('account_balances').select('account_id, balance_cents'),
  ])
  if (accounts.error) throw accounts.error
  if (balances.error) throw balances.error

  const balanceById = new Map(balances.data.map((b) => [b.account_id, b.balance_cents]))
  return accounts.data.map((a) => ({
    ...a,
    balanceCents: balanceById.get(a.id) ?? a.opening_balance_cents,
  }))
}

export async function createAccount(input: AccountInput) {
  const { data, error } = await supabase.from('accounts').insert(input).select().single()
  if (error) throw error
  return data
}

/** The account type is fixed after creation, so it is not part of an update. */
export async function updateAccount(
  id: string,
  input: Omit<AccountInput, 'type'> & { archived?: boolean },
) {
  const { error } = await supabase.from('accounts').update(input).eq('id', id)
  if (error) throw error
}

export async function setAccountArchived(id: string, archived: boolean) {
  const { error } = await supabase.from('accounts').update({ archived }).eq('id', id)
  if (error) throw error
}

export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw error
}
