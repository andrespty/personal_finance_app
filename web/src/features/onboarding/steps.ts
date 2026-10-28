/** profiles.onboarding_step value once guided setup is finished. */
export const ONBOARDING_DONE = 10

/**
 * Steps in order. `id` is what profiles.onboarding_step stores once the step
 * is complete. People who finished setup (10) before a step was added skip it.
 */
export const onboardingSteps = [
  { id: 1, key: 'welcome' },
  { id: 2, key: 'accounts' },
  { id: 3, key: 'cards' },
  { id: 4, key: 'categories' },
  { id: 5, key: 'payers' },
] as const

export type OnboardingStepKey = (typeof onboardingSteps)[number]['key']

export function isOnboarded(onboardingStep: number): boolean {
  return onboardingStep >= ONBOARDING_DONE
}

/** Index of the first step not yet completed, so setup resumes where it left off. */
export function resumeIndex(onboardingStep: number): number {
  const index = onboardingSteps.findIndex((step) => step.id > onboardingStep)
  return index === -1 ? onboardingSteps.length - 1 : index
}
