import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { LoadingBlock } from '@/components/ui'

import { useAuth } from '../hooks/useAuth'

/** Renders children for signed-in people; sends everyone else to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingBlock />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

/** The reverse: keeps signed-in people off the login and sign-up pages. */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingBlock />
  if (session) return <Navigate to="/" replace />
  return children
}
