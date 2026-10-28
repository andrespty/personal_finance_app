import { useState } from 'react'

import { Sheet } from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import {
  describeTransaction,
  TransactionForm,
  TransactionList,
  type Transaction,
} from '@/features/transactions'
import { TransferDetails } from '@/features/transfers'

export type ActivityListProps = {
  accountId?: string
  limit?: number
  groupByDay?: boolean
  emptyText?: string
}

/**
 * Transaction list where tapping a row opens the right sheet: the edit form
 * for regular transactions, or the details of a transfer or payment.
 */
export function ActivityList(props: ActivityListProps) {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { data: accounts = [] } = useAccounts({ includeArchived: true })
  const { data: categories = [] } = useCategories()
  const close = () => setSelected(null)

  const isTransfer = selected !== null && selected.kind !== 'regular'
  const display = selected ? describeTransaction(selected, accounts, categories) : null

  return (
    <>
      <TransactionList {...props} onSelect={setSelected} />
      <Sheet
        open={selected !== null}
        onClose={close}
        title={
          isTransfer ? (selected?.kind === 'payment' ? 'Payment' : 'Transfer') : 'Edit transaction'
        }
      >
        {selected && isTransfer && selected.transfer_id && display ? (
          <TransferDetails
            transferId={selected.transfer_id}
            title={display.title}
            amount={display.amount}
            date={selected.date}
            note={selected.description}
            onDone={close}
          />
        ) : selected ? (
          <TransactionForm transaction={selected} onDone={close} />
        ) : null}
      </Sheet>
    </>
  )
}
