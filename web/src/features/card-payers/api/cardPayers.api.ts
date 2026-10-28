import { supabase } from '@/lib/supabase'

import type { CardSpending, PayerSetup, PayerShare } from '../types'
import { toSetups } from '../utils/payerSetup'

export async function fetchPayerSetups(): Promise<PayerSetup[]> {
  const [payers, rules] = await Promise.all([
    supabase.from('card_payers').select('id, card_id, payer_account_id, is_default'),
    supabase.from('card_payer_categories').select('card_payer_id, category_id'),
  ])
  if (payers.error) throw payers.error
  if (rules.error) throw rules.error
  return toSetups(payers.data, rules.data)
}

export async function fetchPayerShares(): Promise<PayerShare[]> {
  const { data, error } = await supabase
    .from('card_payer_shares')
    .select('card_id, payer_account_id, share_cents')
  if (error) throw error
  return data.map((row) => ({
    cardId: row.card_id,
    payerAccountId: row.payer_account_id,
    shareCents: row.share_cents ?? 0,
  }))
}

/** Charges and refunds on a card since a date, with who pays each. */
export async function fetchCardSpending(cardId: string, since: string): Promise<CardSpending[]> {
  const { data, error } = await supabase
    .from('card_transaction_payers')
    .select('card_id, category_id, payer_account_id, amount_cents')
    .eq('card_id', cardId)
    .eq('kind', 'regular')
    .gte('date', since)
  if (error) throw error
  return data.map((row) => ({
    cardId: row.card_id,
    categoryId: row.category_id,
    payerAccountId: row.payer_account_id,
    amountCents: row.amount_cents,
  }))
}

export async function saveCardPayers(setup: PayerSetup) {
  const { error } = await supabase.rpc('save_card_payers', {
    card_id: setup.cardId,
    default_payer_id: setup.defaultPayerId ?? undefined,
    rules: setup.rules.map((r) => ({
      payer_account_id: r.payerAccountId,
      category_ids: r.categoryIds,
    })),
  })
  if (error) throw error
}
