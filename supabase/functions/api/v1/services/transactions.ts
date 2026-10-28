import type { Db } from '../../_shared/db.ts'
import { formatCents } from '../../_shared/money.ts'
import type { BankEntryInput, CardTransactionInput } from '../schemas/transactions.ts'

type AddedTransaction = {
  id: string
  account: string
  amount_cents: number
  date: string
  category_id: string | null
}

function add(db: Db, userId: string, args: Record<string, unknown>) {
  return db.rpc<AddedTransaction>('api_add_transaction', { user_ref: userId, ...args })
}

/** Charge (+) or refund (−) on a credit card. */
export async function addCardTransaction(db: Db, userId: string, input: CardTransactionInput) {
  const refund = input.type === 'refund'
  const transaction = await add(db, userId, {
    kind: 'card',
    account_ref: input.card,
    amount_cents: refund ? -input.amount : input.amount,
    category_ref: input.category,
    description: input.description ?? null,
    merchant: input.merchant ?? null,
    on_date: input.date ?? null,
  })
  const amount = formatCents(input.amount)
  const message = refund
    ? `Logged a ${amount} refund on ${transaction.account}.`
    : `Logged ${amount}${input.merchant ? ` at ${input.merchant}` : ''} on ${transaction.account}.`
  return { message, transaction }
}

/** Deposit (+) or withdrawal (−) on a checking/savings account. */
export async function addBankEntry(
  db: Db,
  userId: string,
  entry: 'deposit' | 'withdrawal',
  input: BankEntryInput,
) {
  const transaction = await add(db, userId, {
    kind: 'bank',
    account_ref: input.account,
    amount_cents: entry === 'withdrawal' ? -input.amount : input.amount,
    category_ref: input.category ?? null,
    description: input.description ?? null,
    on_date: input.date ?? null,
  })
  const amount = formatCents(input.amount)
  const message = entry === 'deposit'
    ? `Deposited ${amount} into ${transaction.account}.`
    : `Withdrew ${amount} from ${transaction.account}.`
  return { message, transaction }
}
