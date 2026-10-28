import { useState } from 'react'

import { Button, ChevronRightIcon, ListRow, PageHeader, Section } from '@/components/ui'
import { signOut, useAuth } from '@/features/auth'
import { useProfile } from '@/features/profile'
import { errorMessage } from '@/lib/errors'

export function SettingsPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const [error, setError] = useState<string | null>(null)

  async function onSignOut() {
    try {
      await signOut()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Settings" />
      <Section title="Organize">
        <ListRow
          title="Categories"
          subtitle="Groups for your spending"
          to="/settings/categories"
          trailing={<ChevronRightIcon className="text-muted size-4" />}
        />
      </Section>
      <Section title="Account">
        {profile?.display_name && (
          <ListRow
            title="Name"
            trailing={<span className="text-muted truncate text-sm">{profile.display_name}</span>}
          />
        )}
        <ListRow
          title="Email"
          trailing={<span className="text-muted truncate text-sm">{user?.email}</span>}
        />
      </Section>
      {error && (
        <p role="alert" className="text-negative text-sm">
          {error}
        </p>
      )}
      <Button variant="secondary" size="lg" fullWidth onClick={onSignOut}>
        Sign out
      </Button>
    </main>
  )
}
