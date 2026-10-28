import type { StepProps } from '../OnboardingFlow/stepProps'

import { AccountListStep } from './AccountListStep'

export function CardsStep(props: StepProps) {
  const { flow } = props
  return (
    <AccountListStep
      {...props}
      kind="card"
      title="Your credit cards"
      description="Cards start at $0 owed. You'll add their transactions as you go."
      addLabel="Add a card"
      defaultType="credit_card"
      primary={(count) => ({
        label: count === 0 ? 'Skip for now' : 'Continue',
        onClick: () => flow.complete(),
        disabled: flow.saving,
      })}
    />
  )
}
