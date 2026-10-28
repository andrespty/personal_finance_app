import { supabase } from '@/lib/supabase'

import type { MoneyLeft } from '../types'

export async function fetchMoneyLeft(): Promise<MoneyLeft[]> {
  const { data, error } = await supabase
    .from('account_money_left')
    .select('account_id, balance_cents, covers_cents, money_left_cents')
  if (error) throw error
  return data.map((row) => ({
    accountId: row.account_id,
    balanceCents: row.balance_cents ?? 0,
    coversCents: row.covers_cents ?? 0,
    moneyLeftCents: row.money_left_cents ?? 0,
  }))
}
