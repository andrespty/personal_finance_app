import { useState } from 'react'

import { errorMessage } from '@/lib/errors'
import { useUpdateProfile, type Profile } from '@/features/profile'

import { ONBOARDING_DONE, onboardingSteps, resumeIndex } from '../../steps'

export function useOnboardingFlow(profile: Profile) {
  const [index, setIndex] = useState(() => resumeIndex(profile.onboarding_step))
  const [error, setError] = useState<string | null>(null)
  const update = useUpdateProfile()

  const isLast = index === onboardingSteps.length - 1

  /**
   * Saves progress for the current step and moves on. Finishing the last
   * step marks setup as done, which sends the person to the dashboard.
   */
  async function complete(extra: { display_name?: string } = {}) {
    setError(null)
    const stepId = onboardingSteps[index].id
    const nextValue = isLast ? ONBOARDING_DONE : Math.max(profile.onboarding_step, stepId)
    try {
      if (nextValue !== profile.onboarding_step || extra.display_name !== undefined) {
        await update.mutateAsync({ onboarding_step: nextValue, ...extra })
      }
      if (!isLast) setIndex(index + 1)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return {
    index,
    total: onboardingSteps.length,
    step: onboardingSteps[index].key,
    back: index > 0 ? () => setIndex(index - 1) : undefined,
    complete,
    saving: update.isPending,
    error,
  }
}
