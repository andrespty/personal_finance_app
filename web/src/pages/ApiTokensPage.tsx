import { useState } from 'react'

import { Button, LoadingBlock, PageHeader, Section, Sheet } from '@/components/ui'
import { CopyField, CreateTokenForm, TokenList, useApiTokens } from '@/features/api-tokens'
import { env } from '@/lib/env'

const apiBaseUrl = `${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/api/v1`

export function ApiTokensPage() {
  const { data: tokens = [], isPending } = useApiTokens()
  const [creating, setCreating] = useState(false)

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="API tokens" back={{ label: 'Settings', to: '/settings' }} />
      <p className="text-muted -mt-2 text-[15px]">
        Tokens let iPhone Shortcuts add transactions and check money left without opening the app.
        Send one as{' '}
        <span className="text-fg font-mono text-[13px]">Authorization: Bearer pfa_…</span>
      </p>

      <CopyField label="API address" value={apiBaseUrl} />

      <Section title="Active tokens">
        {isPending ? <LoadingBlock /> : <TokenList tokens={tokens} />}
      </Section>

      <Button size="lg" fullWidth onClick={() => setCreating(true)}>
        Create token
      </Button>

      <Sheet open={creating} onClose={() => setCreating(false)} title="New API token">
        <CreateTokenForm onDone={() => setCreating(false)} />
      </Sheet>
    </main>
  )
}
