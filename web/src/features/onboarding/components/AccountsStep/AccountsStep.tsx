import type { StepProps } from '../OnboardingFlow/stepProps'

import { AccountListStep } from './AccountListStep'

export function AccountsStep(props: StepProps) {
  const { flow } = props
  return (
    <AccountListStep
      {...props}
      kind="bank"
      title="Your accounts"
      description="Add the checking and savings accounts you use, with what each has today."
      addLabel="Add checking or savings"
      defaultType="checking"
      primary={(count) => ({
        label: count === 0 ? 'Add at least one account' : 'Continue',
        onClick: () => flow.complete(),
        disabled: count === 0 || flow.saving,
      })}
    />
  )
}
