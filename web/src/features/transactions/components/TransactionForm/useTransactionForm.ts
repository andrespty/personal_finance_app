import { useState, type FormEvent } from 'react'
import { useAccounts, type Account } from '@/features/accounts'
import { todayISO } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { fieldErrors } from '@/lib/validation'
import { centsToInput } from '@/lib/money'

import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '../../api/transactions.queries'
import { transactionFormSchema } from '../../schemas'
import type { EntryType, Transaction } from '../../types'
import { entryTypeOf, isCardEntry, signedCents } from '../../utils/entryType'

type Field = 'accountId' | 'amount' | 'categoryId' | 'text' | 'date'

/** Accounts a given entry type can be recorded on. */
export function accountsForEntry(accounts: Account[], entry: EntryType): Account[] {
  return accounts.filter((a) => (a.type === 'credit_card') === isCardEntry(entry))
}

export function useTransactionForm({
  transaction,
  defaultAccountId,
  onDone,
}: {
  transaction?: Transaction
  defaultAccountId?: string
  onDone: () => void
}) {
  const { data: accounts = [] } = useAccounts()
  const initialAccount = accounts.find(
    (a) => a.id === (transaction?.account_id ?? defaultAccountId),
  )

  const [entryType, setEntryTypeState] = useState<EntryType>(() => {
    if (transaction && initialAccount)
      return entryTypeOf(transaction.amount_cents, initialAccount.type)
    if (initialAccount) return initialAccount.type === 'credit_card' ? 'charge' : 'withdrawal'
    return accounts.some((a) => a.type === 'credit_card') ? 'charge' : 'withdrawal'
  })
  const [accountId, setAccountId] = useState(
    () => initialAccount?.id ?? accountsForEntry(accounts, entryType)[0]?.id ?? '',
  )
  const [amount, setAmount] = useState(transaction ? centsToInput(transaction.amount_cents) : '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? '')
  const [text, setText] = useState(transaction?.merchant ?? transaction?.description ?? '')
  const [date, setDate] = useState(transaction?.date ?? todayISO())
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const create = useCreateTransaction()
  const update = useUpdateTransaction()
  const remove = useDeleteTransaction()

  // Switching between card and bank entries moves the account to a matching one.
  function setEntryType(next: EntryType) {
    setEntryTypeState(next)
    const options = accountsForEntry(accounts, next)
    if (!options.some((a) => a.id === accountId)) setAccountId(options[0]?.id ?? '')
  }

  /** Wraps a setter so editing a field clears its error. */
  function withClear<T>(field: Field, setter: (value: T) => void) {
    return (value: T) => {
      setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
      setter(value)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = transactionFormSchema.safeParse({
      entryType,
      accountId,
      amount,
      categoryId,
      text,
      date,
    })
    if (!parsed.success) {
      setErrors(fieldErrors<Field>(parsed.error))
      return
    }
    setErrors({})

    const v = parsed.data
    const card = isCardEntry(v.entryType)
    const label = v.text === '' ? null : v.text
    const input = {
      account_id: v.accountId,
      amount_cents: signedCents(v.entryType, v.amount),
      date: v.date,
      category_id: v.categoryId === '' ? null : v.categoryId,
      // Cards record a merchant, bank accounts a description. Keep whichever
      // field this form doesn't edit (e.g. a note from a Shortcut).
      merchant: card ? label : (transaction?.merchant ?? null),
      description: card ? (transaction?.description ?? null) : label,
    }
    try {
      if (transaction) await update.mutateAsync({ id: transaction.id, input })
      else await create.mutateAsync(input)
      onDone()
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  async function onDelete() {
    if (!transaction) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    try {
      await remove.mutateAsync(transaction.id)
      onDone()
    } catch (error) {
      setConfirmingDelete(false)
      setFormError(errorMessage(error))
    }
  }

  return {
    isEdit: Boolean(transaction),
    accounts,
    accountOptions: accountsForEntry(accounts, entryType),
    values: { entryType, accountId, amount, categoryId, text, date },
    set: {
      entryType: setEntryType,
      accountId: withClear('accountId', setAccountId),
      amount: withClear('amount', setAmount),
      categoryId: withClear('categoryId', setCategoryId),
      text: withClear('text', setText),
      date: withClear('date', setDate),
    },
    errors,
    formError,
    confirmingDelete,
    submitting: create.isPending || update.isPending || remove.isPending,
    onSubmit,
    onDelete,
  }
}
