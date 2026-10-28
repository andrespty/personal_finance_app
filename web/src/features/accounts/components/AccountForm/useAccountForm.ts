import { useState, type FormEvent } from 'react'
import { errorMessage } from '@/lib/errors'
import { fieldErrors } from '@/lib/validation'
import { centsToInput } from '@/lib/money'

import { useCreateAccount, useUpdateAccount } from '../../api/accounts.queries'
import { accountFormSchema } from '../../schemas'
import type { Account, AccountType } from '../../types'

type Field = 'name' | 'alias' | 'walletName' | 'openingBalance' | 'creditLimit'

export function useAccountForm({
  account,
  defaultType = 'checking',
  onDone,
}: {
  account?: Account
  defaultType?: AccountType
  onDone: (accountId: string) => void
}) {
  const [type, setType] = useState<AccountType>(account?.type ?? defaultType)
  const [name, setName] = useState(account?.name ?? '')
  const [alias, setAlias] = useState(account?.alias ?? '')
  const [walletName, setWalletName] = useState(account?.wallet_name ?? '')
  const [openingBalance, setOpeningBalance] = useState(
    account && account.type !== 'credit_card' ? centsToInput(account.opening_balance_cents) : '',
  )
  const [creditLimit, setCreditLimit] = useState(
    account?.credit_limit_cents != null ? centsToInput(account.credit_limit_cents) : '',
  )
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const create = useCreateAccount()
  const update = useUpdateAccount()

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
    const parsed = accountFormSchema.safeParse({
      name,
      type,
      alias,
      walletName,
      openingBalance,
      creditLimit,
    })
    if (!parsed.success) {
      setErrors(fieldErrors<Field>(parsed.error))
      return
    }
    setErrors({})
    try {
      if (account) {
        const { type: _type, ...input } = parsed.data
        await update.mutateAsync({ id: account.id, input })
        onDone(account.id)
      } else {
        const created = await create.mutateAsync(parsed.data)
        onDone(created.id)
      }
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return {
    isEdit: Boolean(account),
    values: { type, name, alias, walletName, openingBalance, creditLimit },
    set: {
      type: setType,
      name: withClear('name', setName),
      alias: withClear('alias', setAlias),
      walletName: withClear('walletName', setWalletName),
      openingBalance: withClear('openingBalance', setOpeningBalance),
      creditLimit: withClear('creditLimit', setCreditLimit),
    },
    errors,
    formError,
    submitting: create.isPending || update.isPending,
    onSubmit,
  }
}
