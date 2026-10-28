import type { Db } from '../../_shared/db.ts'
import { ApiError } from '../../_shared/errors.ts'
import { formatCents } from '../../_shared/money.ts'

type MoneyLeftRow = {
  id: string
  name: string
  alias: string | null
  balance_cents: number
  covers_cents: number
  money_left_cents: number
}

/** Money left per checking/savings account, or for one account. */
export async function getMoneyLeft(db: Db, userId: string, account?: string) {
  const rows = await db.rpc<MoneyLeftRow[]>('api_money_left', { user_ref: userId })

  if (account) {
    const needle = account.trim().toLowerCase()
    const match = rows.find((r) =>
      r.id === needle || r.alias === needle || r.name.toLowerCase() === needle
    )
    if (!match) throw new ApiError(404, `No checking or savings account named "${account.trim()}".`)
    return {
      message: `${match.name} has ${formatCents(match.money_left_cents)} left.`,
      accounts: [match],
    }
  }

  const total = rows.reduce((sum, r) => sum + r.money_left_cents, 0)
  const parts = rows.map((r) => `${r.name}: ${formatCents(r.money_left_cents)}`)
  return {
    message: rows.length === 0
      ? 'You don’t have any checking or savings accounts yet.'
      : `${formatCents(total)} left. ${parts.join('. ')}.`,
    total_money_left_cents: total,
    accounts: rows,
  }
}
