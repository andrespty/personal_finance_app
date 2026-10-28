import { createBrowserRouter } from 'react-router'

import { RedirectIfSignedIn, RequireAuth } from '@/features/auth'
import { RequireOnboarded } from '@/features/onboarding'
import { AccountDetailPage } from '@/pages/AccountDetailPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { ActivityPage } from '@/pages/ActivityPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SetupPage } from '@/pages/SetupPage'
import { SignUpPage } from '@/pages/SignUpPage'

import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'

export const router = createBrowserRouter([
  {
    element: (
      <RedirectIfSignedIn>
        <AuthLayout />
      </RedirectIfSignedIn>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ],
  },
  {
    path: 'setup',
    element: (
      <RequireAuth>
        <SetupPage />
      </RequireAuth>
    ),
  },
  {
    element: (
      <RequireAuth>
        <RequireOnboarded>
          <AppLayout />
        </RequireOnboarded>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'accounts/:accountId', element: <AccountDetailPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/categories', element: <CategoriesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
