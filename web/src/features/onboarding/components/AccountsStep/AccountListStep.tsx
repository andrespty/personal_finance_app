import { useState } from 'react'

import { Button, ListRow, Sheet } from '@/components/ui'
import { AccountForm, accountTypeLabels, useAccounts, type AccountType } from '@/features/accounts'
import { formatCents } from '@/lib/money'

import { StepLayout, type StepAction } from '../StepLayout/StepLayout'
import type { StepProps } from '../OnboardingFlow/stepProps'

type AccountListStepProps = StepProps & {
  kind: 'bank' | 'card'
  title: string
  description: string
  addLabel: string
  defaultType: AccountType
  /** Builds the step's main button from how many accounts of this kind exist. */
  primary: (count: number) => StepAction
}

/** Shared by the accounts and cards steps: list what's added, add more. */
export function AccountListStep({
  flow,
  kind,
  title,
  description,
  addLabel,
  defaultType,
  primary,
}: AccountListStepProps) {
  const { data: accounts = [] } = useAccounts()
  const [adding, setAdding] = useState(false)
  const listed = accounts.filter((a) => (a.type === 'credit_card') === (kind === 'card'))

  return (
    <StepLayout
      index={flow.index}
      total={flow.total}
      title={title}
      description={description}
      primary={primary(listed.length)}
      error={flow.error}
    >
      <div className="flex flex-col">
        {listed.map((account) => (
          <ListRow
            key={account.id}
            title={account.name}
            subtitle={accountTypeLabels[account.type]}
            trailing={
              <span className="num text-[15px] font-semibold">
                {kind === 'card'
                  ? account.credit_limit_cents
                    ? `Limit ${formatCents(account.credit_limit_cents)}`
                    : ''
                  : formatCents(account.balanceCents)}
              </span>
            }
          />
        ))}
        <Button variant="secondary" className="mt-4" onClick={() => setAdding(true)}>
          {addLabel}
        </Button>
      </div>
      <Sheet open={adding} onClose={() => setAdding(false)} title={addLabel}>
        <AccountForm defaultType={defaultType} onDone={() => setAdding(false)} />
      </Sheet>
    </StepLayout>
  )
}
