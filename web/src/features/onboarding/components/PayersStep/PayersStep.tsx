import { useState } from 'react'

import { ChevronRightIcon, ListRow, Sheet } from '@/components/ui'
import { isCard, useAccounts, type Account } from '@/features/accounts'
import { CardPayersForm, isConfigured, usePayerSetups } from '@/features/card-payers'

import type { StepProps } from '../OnboardingFlow/stepProps'
import { StepLayout } from '../StepLayout/StepLayout'

export function PayersStep({ flow }: StepProps) {
  const { data: accounts = [] } = useAccounts()
  const { data: setups = [] } = usePayerSetups()
  const [editing, setEditing] = useState<Account | null>(null)

  const cards = accounts.filter(isCard)
  const nameOf = (id: string | null) => accounts.find((a) => a.id === id)?.name
  const summary = (card: Account) => {
    const setup = setups.find((s) => s.cardId === card.id)
    if (!setup || !isConfigured(setup)) return 'Not set up yet'
    const extra =
      setup.rules.length > 0
        ? ` · ${setup.rules.length === 1 ? '1 split' : `${setup.rules.length} splits`}`
        : ''
    return setup.defaultPayerId
      ? `${nameOf(setup.defaultPayerId)} pays${extra}`
      : `Split by category${extra}`
  }

  return (
    <StepLayout
      index={flow.index}
      total={flow.total}
      title="Who pays your cards"
      description={
        cards.length === 0
          ? 'You haven’t added any cards. You can set this up later on each card.'
          : 'Pick the account that pays each card. Money left subtracts each card’s share from the account that pays it.'
      }
      primary={{ label: 'Finish setup', onClick: () => flow.complete(), disabled: flow.saving }}
      error={flow.error}
    >
      {cards.length > 0 && (
        <div className="flex flex-col">
          {cards.map((card) => (
            <ListRow
              key={card.id}
              title={card.name}
              subtitle={summary(card)}
              onClick={() => setEditing(card)}
              trailing={<ChevronRightIcon className="text-muted size-4" />}
            />
          ))}
        </div>
      )}
      <Sheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Who pays ${editing.name}` : ''}
      >
        {editing && <CardPayersForm cardId={editing.id} onDone={() => setEditing(null)} />}
      </Sheet>
    </StepLayout>
  )
}
