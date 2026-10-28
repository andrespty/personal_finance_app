import {
  AmountField,
  Button,
  EmptyState,
  LoadingBlock,
  SelectField,
  TextField,
} from '@/components/ui'
import { useAccounts } from '@/features/accounts'

import { useTransferForm } from './useTransferForm'

export type TransferFormProps = {
  defaultFromId?: string
  defaultToId?: string
  onDone: () => void
}

/** Moves money between checking/savings, or pays a card from one. */
export function TransferForm(props: TransferFormProps) {
  const accounts = useAccounts()
  if (accounts.isPending) return <LoadingBlock />
  const data = accounts.data ?? []
  if (data.filter((a) => a.type !== 'credit_card').length === 0 || data.length < 2) {
    return (
      <EmptyState
        title="You need two accounts"
        body="Add a checking or savings account and somewhere to move money to."
      />
    )
  }
  return <TransferFormFields {...props} />
}

function TransferFormFields({ defaultFromId, defaultToId, onDone }: TransferFormProps) {
  const form = useTransferForm({ defaultFromId, defaultToId, onDone })
  const { values, set, errors } = form

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-5">
      <AmountField
        label="Amount"
        value={values.amount}
        onChange={set.amount}
        error={errors.amount}
        autoFocus
      />
      <div className="flex flex-col gap-4">
        <SelectField
          label="From"
          value={values.fromAccountId}
          onChange={set.fromAccountId}
          options={form.sources.map((a) => ({ value: a.id, label: a.name }))}
          error={errors.fromAccountId}
        />
        <SelectField
          label="To"
          value={values.toAccountId}
          onChange={set.toAccountId}
          placeholder="Choose an account"
          options={form.destinations.map((a) => ({
            value: a.id,
            label: a.type === 'credit_card' ? `${a.name} (card payment)` : a.name,
          }))}
          error={errors.toAccountId}
          hint={form.isPayment ? 'This pays down the card.' : undefined}
        />
        <TextField
          label="Note"
          placeholder="Optional"
          value={values.note}
          onChange={set.note}
          error={errors.note}
        />
        <TextField
          label="Date"
          type="date"
          value={values.date}
          onChange={set.date}
          error={errors.date}
        />
      </div>
      {form.formError && (
        <p role="alert" className="text-negative text-sm">
          {form.formError}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={form.submitting}>
        {form.isPayment ? 'Pay card' : 'Move money'}
      </Button>
    </form>
  )
}
