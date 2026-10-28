import { useState, type FormEvent } from 'react'
import { useAccounts } from '@/features/accounts'
import { todayISO } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { fieldErrors } from '@/lib/validation'

import { useCreateTransfer } from '../../api/transfers.queries'
import { transferFormSchema } from '../../schemas'

type Field = 'fromAccountId' | 'toAccountId' | 'amount' | 'date' | 'note'

export function useTransferForm({
  defaultFromId,
  defaultToId,
  onDone,
}: {
  defaultFromId?: string
  defaultToId?: string
  onDone: () => void
}) {
  const { data: accounts = [] } = useAccounts()
  const sources = accounts.filter((a) => a.type !== 'credit_card')

  const [fromAccountId, setFromAccountId] = useState(
    defaultFromId ?? sources.find((a) => a.id !== defaultToId)?.id ?? '',
  )
  const [toAccountId, setToAccountId] = useState(
    defaultToId ?? accounts.find((a) => a.id !== fromAccountId)?.id ?? '',
  )
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const create = useCreateTransfer()
  const destinations = accounts.filter((a) => a.id !== fromAccountId)
  const isPayment = accounts.find((a) => a.id === toAccountId)?.type === 'credit_card'

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
    const parsed = transferFormSchema.safeParse({ fromAccountId, toAccountId, amount, date, note })
    if (!parsed.success) {
      setErrors(fieldErrors<Field>(parsed.error))
      return
    }
    setErrors({})
    const v = parsed.data
    try {
      await create.mutateAsync({
        fromAccountId: v.fromAccountId,
        toAccountId: v.toAccountId,
        amountCents: v.amount,
        date: v.date,
        note: v.note,
      })
      onDone()
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return {
    sources,
    destinations,
    isPayment,
    values: { fromAccountId, toAccountId, amount, date, note },
    set: {
      fromAccountId: withClear('fromAccountId', setFromAccountId),
      toAccountId: withClear('toAccountId', setToAccountId),
      amount: withClear('amount', setAmount),
      date: withClear('date', setDate),
      note: withClear('note', setNote),
    },
    errors,
    formError,
    submitting: create.isPending,
    onSubmit,
  }
}
