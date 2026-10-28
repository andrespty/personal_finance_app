import type { Db } from '../../_shared/db.ts'
import { formatCents } from '../../_shared/money.ts'
import type { TransferInput } from '../schemas/transfers.ts'

type CreatedTransfer = { id: string; from: string; to: string; amount_cents: number; date: string }

/** Moves money between two checking/savings accounts. */
export async function createTransfer(db: Db, userId: string, input: TransferInput) {
  const transfer = await db.rpc<CreatedTransfer>('api_transfer', {
    user_ref: userId,
    from_ref: input.from,
    to_ref: input.to,
    amount_cents: input.amount,
    on_date: input.date ?? null,
    note: input.note ?? null,
  })
  return {
    message: `Moved ${formatCents(transfer.amount_cents)} from ${transfer.from} to ${transfer.to}.`,
    transfer,
  }
}
