import type { Account } from '@/features/accounts'
import { categoryLabel, type Category } from '@/features/categories'
import { formatCents } from '@/lib/money'

import type { Transaction } from '../types'

import { entryTypeLabels, entryTypeOf } from './entryType'

export type TransactionDisplay = {
  title: string
  detail: string
  amount: string
  /** positive = good for you: money in, or less owed on a card. */
  tone: 'positive' | 'neutral'
}

/** Everything a row needs to show one transaction. */
export function describeTransaction(
  tx: Transaction,
  accounts: Account[],
  categories: Category[],
): TransactionDisplay {
  const account = accounts.find((a) => a.id === tx.account_id)
  const isCardAccount = account?.type === 'credit_card'
  const nameOf = (id: string | undefined) =>
    accounts.find((a) => a.id === id)?.name ?? 'another account'

  let title: string
  let detail: string

  if (tx.kind === 'regular') {
    const category = categories.find((c) => c.id === tx.category_id)
    const entry = entryTypeLabels[entryTypeOf(tx.amount_cents, account?.type ?? 'checking')]
    title = tx.merchant ?? tx.description ?? category?.name ?? entry
    detail = [category ? categoryLabel(category, categories) : entry, account?.name]
      .filter(Boolean)
      .join(' · ')
  } else {
    const outgoing = tx.transfer?.from_account_id === tx.account_id
    const other = nameOf(outgoing ? tx.transfer?.to_account_id : tx.transfer?.from_account_id)
    const kind = tx.kind === 'payment' ? 'Payment' : 'Transfer'
    title = `${kind} ${outgoing ? 'to' : 'from'} ${other}`
    detail = [tx.description, account?.name].filter(Boolean).join(' · ')
  }

  const positive = isCardAccount ? tx.amount_cents < 0 : tx.amount_cents > 0
  const amount =
    isCardAccount && tx.amount_cents > 0
      ? formatCents(tx.amount_cents)
      : formatCents(tx.amount_cents, { signed: true })

  return { title, detail, amount, tone: positive ? 'positive' : 'neutral' }
}
