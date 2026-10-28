import {
  AmountField,
  Button,
  EmptyState,
  LoadingBlock,
  SegmentedControl,
  SelectField,
  TextField,
  type Segment,
} from '@/components/ui'
import { useAccounts } from '@/features/accounts'
import { buildCategoryTree, useCategories } from '@/features/categories'

import type { EntryType, Transaction } from '../../types'
import { bankEntryTypes, cardEntryTypes, entryTypeLabels, isCardEntry } from '../../utils/entryType'

import { useTransactionForm } from './useTransactionForm'

export type TransactionFormProps = {
  transaction?: Transaction
  defaultAccountId?: string
  onDone: () => void
}

/** Waits for accounts so the form can pick sensible defaults on first render. */
export function TransactionForm(props: TransactionFormProps) {
  const accounts = useAccounts()
  const categories = useCategories()
  if (accounts.isPending || categories.isPending) return <LoadingBlock />
  if (!accounts.data?.length) {
    return (
      <EmptyState title="Add an account first" body="Transactions belong to an account or card." />
    )
  }
  return <TransactionFormFields {...props} />
}

function TransactionFormFields({ transaction, defaultAccountId, onDone }: TransactionFormProps) {
  const form = useTransactionForm({ transaction, defaultAccountId, onDone })
  const { values, set, errors } = form
  const tree = buildCategoryTree(form.categories)
  const subcategories = tree.find((c) => c.id === values.categoryId)?.children ?? []

  const hasCards = form.accounts.some((a) => a.type === 'credit_card')
  const hasBank = form.accounts.some((a) => a.type !== 'credit_card')
  const entryOptions: Segment<EntryType>[] = [
    ...(hasCards ? cardEntryTypes : []),
    ...(hasBank ? bankEntryTypes : []),
  ].map((value) => ({ value, label: entryTypeLabels[value] }))
  const card = isCardEntry(values.entryType)

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-5">
      <SegmentedControl
        label="Type"
        value={values.entryType}
        options={entryOptions}
        onChange={set.entryType}
      />
      <AmountField
        label="Amount"
        value={values.amount}
        onChange={set.amount}
        error={errors.amount}
        autoFocus={!form.isEdit}
      />
      <div className="flex flex-col gap-4">
        <SelectField
          label={card ? 'Card' : 'Account'}
          value={values.accountId}
          onChange={set.accountId}
          options={form.accountOptions.map((a) => ({ value: a.id, label: a.name }))}
          error={errors.accountId}
        />
        <SelectField
          label="Category"
          value={values.categoryId}
          onChange={set.categoryId}
          placeholder={card ? 'Choose a category' : undefined}
          options={[
            ...(card ? [] : [{ value: '', label: 'None' }]),
            ...tree.map((c) => ({ value: c.id, label: c.name })),
          ]}
          error={errors.categoryId}
          hint={tree.length === 0 ? 'Add categories in Settings.' : undefined}
        />
        {subcategories.length > 0 && (
          <SelectField
            label="Subcategory"
            value={values.subcategoryId}
            onChange={set.subcategoryId}
            options={[
              { value: '', label: 'None' },
              ...subcategories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        )}
        <TextField
          label={card ? 'Merchant' : 'Description'}
          placeholder={card ? 'Where you bought it' : 'Optional'}
          value={values.text}
          onChange={set.text}
          error={errors.text}
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
        Save
      </Button>
      {form.isEdit && (
        <Button
          variant="ghost"
          fullWidth
          onClick={form.onDelete}
          disabled={form.submitting}
          className="text-negative"
        >
          {form.confirmingDelete ? 'Tap again to delete' : 'Delete transaction'}
        </Button>
      )}
    </form>
  )
}
