import { EmptyState, LoadingBlock } from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { formatDay } from '@/lib/dates'

import { useTransactions } from '../../api/transactions.queries'
import type { Transaction, TransactionFilters } from '../../types'
import { describeTransaction } from '../../utils/describeTransaction'

import { TransactionRow } from './TransactionRow'

export type TransactionListProps = TransactionFilters & {
  onSelect?: (transaction: Transaction) => void
  /** Show a date heading above each day's transactions. */
  groupByDay?: boolean
  emptyText?: string
}

export function TransactionList({
  accountId,
  limit,
  onSelect,
  groupByDay = false,
  emptyText = 'No transactions yet.',
}: TransactionListProps) {
  const transactions = useTransactions({ accountId, limit })
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()

  if (transactions.isPending) return <LoadingBlock />
  if (transactions.isError)
    return (
      <EmptyState title="Couldn’t load transactions." body="Pull to refresh or try again later." />
    )
  if (transactions.data.length === 0) return <EmptyState title={emptyText} />

  const rows = transactions.data.map((tx, i, all) => ({
    tx,
    display: describeTransaction(tx, accounts, categories),
    dayHeading: groupByDay && (i === 0 || all[i - 1].date !== tx.date) ? formatDay(tx.date) : null,
  }))

  return (
    <div className="flex flex-col">
      {rows.map(({ tx, display, dayHeading }) => (
        <div key={tx.id} className="flex flex-col">
          {dayHeading && (
            <h3 className="text-muted pt-5 pb-1 text-[13px] font-medium">{dayHeading}</h3>
          )}
          <TransactionRow display={display} onClick={onSelect && (() => onSelect(tx))} />
        </div>
      ))}
    </div>
  )
}
