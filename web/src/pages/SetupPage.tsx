import { OnboardingFlow, RedirectIfOnboarded } from '@/features/onboarding'

export function SetupPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pt-[max(20px,env(safe-area-inset-top))] pb-0">
      <RedirectIfOnboarded>{(profile) => <OnboardingFlow profile={profile} />}</RedirectIfOnboarded>
    </div>
  )
}
