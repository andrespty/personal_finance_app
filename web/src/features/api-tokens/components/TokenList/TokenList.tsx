import { useState } from 'react'

import { EmptyState, ListRow } from '@/components/ui'
import { formatDay, todayISO } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'

import { useRevokeApiToken } from '../../api/apiTokens.queries'
import type { ApiToken } from '../../types'

const day = (timestamp: string) => formatDay(todayISO(new Date(timestamp)))

export function TokenList({ tokens }: { tokens: ApiToken[] }) {
  const revoke = useRevokeApiToken()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onRevoke(id: string) {
    if (confirming !== id) {
      setConfirming(id)
      return
    }
    setError(null)
    try {
      await revoke.mutateAsync(id)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setConfirming(null)
    }
  }

  if (tokens.length === 0) {
    return <EmptyState title="No tokens yet" body="Create one to connect iPhone Shortcuts." />
  }

  return (
    <div className="flex flex-col">
      {tokens.map((token) => (
        <ListRow
          key={token.id}
          title={token.name}
          subtitle={`${token.token_prefix}… · ${
            token.last_used_at ? `Last used ${day(token.last_used_at).toLowerCase()}` : 'Never used'
          }`}
          trailing={
            <button
              type="button"
              onClick={() => onRevoke(token.id)}
              disabled={revoke.isPending}
              className="text-negative focus-visible:outline-accent text-sm font-medium focus-visible:outline-2"
            >
              {confirming === token.id ? 'Tap to confirm' : 'Revoke'}
            </button>
          }
        />
      ))}
      {error && (
        <p role="alert" className="text-negative pt-3 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
