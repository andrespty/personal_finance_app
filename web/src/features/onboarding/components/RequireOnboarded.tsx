import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { EmptyState, LoadingBlock } from '@/components/ui'
import { useProfile, type Profile } from '@/features/profile'

import { isOnboarded } from '../steps'

/** Sends people who haven't finished guided setup to /setup. */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const { data: profile, isPending, isError } = useProfile()
  if (isPending) return <LoadingBlock />
  if (isError)
    return (
      <EmptyState title="Couldn’t load your profile." body="Check your connection and reload." />
    )
  if (!isOnboarded(profile.onboarding_step)) return <Navigate to="/setup" replace />
  return children
}

/** The reverse: keeps people who finished setup off /setup. */
export function RedirectIfOnboarded({ children }: { children: (profile: Profile) => ReactNode }) {
  const { data: profile, isPending, isError } = useProfile()
  if (isPending) return <LoadingBlock />
  if (isError)
    return (
      <EmptyState title="Couldn’t load your profile." body="Check your connection and reload." />
    )
  if (isOnboarded(profile.onboarding_step)) return <Navigate to="/" replace />
  return children(profile)
}
