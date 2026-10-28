import { useState } from 'react'

import { TextField } from '@/components/ui'

import { StepLayout } from '../StepLayout/StepLayout'
import type { StepProps } from '../OnboardingFlow/stepProps'

export function WelcomeStep({ flow, profile }: StepProps) {
  const [name, setName] = useState(profile.display_name ?? '')
  const [error, setError] = useState<string>()

  function onContinue() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter your name.')
      return
    }
    flow.complete({ display_name: trimmed.slice(0, 80) })
  }

  return (
    <StepLayout
      index={flow.index}
      total={flow.total}
      title="Welcome"
      description="A few quick steps: your accounts, your cards, and the categories you spend in."
      primary={{ label: 'Continue', onClick: onContinue, disabled: flow.saving }}
      error={flow.error}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onContinue()
        }}
      >
        <TextField
          label="What should we call you?"
          autoComplete="given-name"
          value={name}
          onChange={(v) => {
            setName(v)
            setError(undefined)
          }}
          error={error}
          autoFocus
        />
      </form>
    </StepLayout>
  )
}
