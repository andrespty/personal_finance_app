import { Button, SegmentedControl, TextField, type Segment } from '@/components/ui'

import type { Account, AccountType } from '../../types'
import { accountTypeLabels } from '../../utils/accountType'

import { CardColorPicker } from '../CardColorPicker/CardColorPicker'

import { useAccountForm } from './useAccountForm'

const typeOptions: Segment<AccountType>[] = [
  { value: 'checking', label: accountTypeLabels.checking },
  { value: 'savings', label: accountTypeLabels.savings },
  { value: 'credit_card', label: 'Card' },
]

export type AccountFormProps = {
  account?: Account
  defaultType?: AccountType
  onDone: (accountId: string) => void
}

export function AccountForm({ account, defaultType, onDone }: AccountFormProps) {
  const form = useAccountForm({ account, defaultType, onDone })
  const { values, set, errors } = form
  const card = values.type === 'credit_card'

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-5">
      <SegmentedControl
        label="Account type"
        value={values.type}
        options={typeOptions}
        onChange={set.type}
        disabled={form.isEdit}
      />
      <div className="flex flex-col gap-4">
        <TextField
          label="Name"
          placeholder={card ? 'Venture X' : 'General Checking'}
          value={values.name}
          onChange={set.name}
          error={errors.name}
          autoFocus={!form.isEdit}
        />
        {card ? (
          <TextField
            label="Credit limit"
            inputMode="decimal"
            placeholder="Optional"
            value={values.creditLimit}
            onChange={set.creditLimit}
            error={errors.creditLimit}
          />
        ) : (
          <TextField
            label="Current balance"
            inputMode="decimal"
            placeholder="0.00"
            value={values.openingBalance}
            onChange={set.openingBalance}
            error={errors.openingBalance}
            hint="What the account has today. New transactions are added on top."
          />
        )}
        <TextField
          label="Short name"
          placeholder={card ? 'vx' : 'general'}
          autoCapitalize="none"
          autoCorrect="off"
          value={values.alias}
          onChange={set.alias}
          error={errors.alias}
          hint="Optional. Used by iPhone Shortcuts and Siri."
        />
        {card && (
          <TextField
            label="Apple Wallet name"
            placeholder="Optional"
            value={values.walletName}
            onChange={set.walletName}
            error={errors.walletName}
            hint="The card's name in Wallet, so Apple Pay purchases log here."
          />
        )}
        {card && <CardColorPicker value={values.cardColor} onChange={set.cardColor} />}
      </div>
      {form.formError && (
        <p role="alert" className="text-negative text-sm">
          {form.formError}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={form.submitting}>
        {form.isEdit ? 'Save' : 'Add account'}
      </Button>
    </form>
  )
}
