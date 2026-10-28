import { supabase } from '@/lib/supabase'

import type { TransferInput } from '../types'

/** Creates a transfer (bank → bank) or payment (bank → card) and both rows. */
export async function createTransfer(input: TransferInput) {
  const { error } = await supabase.rpc('create_transfer', {
    from_account_id: input.fromAccountId,
    to_account_id: input.toAccountId,
    amount_cents: input.amountCents,
    on_date: input.date,
    note: input.note ?? undefined,
  })
  if (error) throw error
}

/** Deleting the transfer removes both of its transaction rows. */
export async function deleteTransfer(id: string) {
  const { error } = await supabase.from('transfers').delete().eq('id', id)
  if (error) throw error
}
