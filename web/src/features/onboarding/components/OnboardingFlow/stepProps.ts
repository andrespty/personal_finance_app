import type { Profile } from '@/features/profile'

import type { useOnboardingFlow } from './useOnboardingFlow'

export type StepProps = {
  flow: ReturnType<typeof useOnboardingFlow>
  profile: Profile
}
