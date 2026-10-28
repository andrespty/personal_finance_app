import { describe, expect, it } from 'vitest'

import { isOnboarded, ONBOARDING_DONE, onboardingSteps, resumeIndex } from './steps'

describe('resumeIndex', () => {
  it('resumes at the first unfinished step', () => {
    expect(resumeIndex(0)).toBe(0)
    expect(onboardingSteps[resumeIndex(2)].key).toBe('cards')
  })
})

describe('isOnboarded', () => {
  it('is true only once setup is finished', () => {
    expect(isOnboarded(4)).toBe(false)
    expect(isOnboarded(ONBOARDING_DONE)).toBe(true)
  })
})
