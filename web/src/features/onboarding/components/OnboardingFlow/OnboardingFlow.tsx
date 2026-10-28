import { ChevronLeftIcon } from '@/components/ui'
import { signOut } from '@/features/auth'
import type { Profile } from '@/features/profile'

import { AccountsStep } from '../AccountsStep/AccountsStep'
import { CardsStep } from '../AccountsStep/CardsStep'
import { CategoriesStep } from '../CategoriesStep/CategoriesStep'
import { WelcomeStep } from '../WelcomeStep/WelcomeStep'

import { useOnboardingFlow } from './useOnboardingFlow'

const stepComponents = {
  welcome: WelcomeStep,
  accounts: AccountsStep,
  cards: CardsStep,
  categories: CategoriesStep,
}

export function OnboardingFlow({ profile }: { profile: Profile }) {
  const flow = useOnboardingFlow(profile)
  const Step = stepComponents[flow.step]
  const navClass = 'text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-accent'

  return (
    <main className="flex flex-col gap-6">
      <div className="flex min-h-6 items-center justify-between">
        {flow.back ? (
          <button
            type="button"
            onClick={flow.back}
            className={`${navClass} text-accent -ml-1 flex items-center`}
          >
            <ChevronLeftIcon className="size-5" />
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => signOut()} className={`${navClass} text-muted`}>
          Sign out
        </button>
      </div>
      <Step key={flow.step} flow={flow} profile={profile} />
    </main>
  )
}
