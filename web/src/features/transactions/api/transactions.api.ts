import { supabase } from '@/lib/supabase'

import type { Transaction, TransactionFilters, TransactionInput } from '../types'

export async function fetchTransactions({
  accountId,
  limit = 100,
}: TransactionFilters): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select(
      '*, transfer:transfers!transactions_transfer_id_user_id_fkey(from_account_id, to_account_id)',
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (accountId) query = query.eq('account_id', accountId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createTransaction(input: TransactionInput) {
  const { error } = await supabase.from('transactions').insert(input)
  if (error) throw error
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const { error } = await supabase.from('transactions').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
