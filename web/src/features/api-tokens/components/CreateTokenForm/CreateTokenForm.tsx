import { useState, type FormEvent } from 'react'

import { Button, TextField } from '@/components/ui'
import { errorMessage } from '@/lib/errors'

import { useCreateApiToken } from '../../api/apiTokens.queries'
import { CopyField } from '../CopyField/CopyField'

/** Names a new token, then shows it once so it can be pasted into Shortcuts. */
export function CreateTokenForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('iPhone')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const create = useCreateApiToken()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      setToken(await create.mutateAsync(name))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (token) {
    return (
      <div className="flex flex-col gap-5">
        <CopyField label="Your new token" value={token} />
        <p className="text-muted text-sm">
          Copy it now and paste it into your Shortcuts. For your security it won’t be shown again.
          If you lose it, revoke it and create a new one.
        </p>
        <Button size="lg" fullWidth onClick={onDone}>
          Done
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label="Name"
        value={name}
        onChange={setName}
        hint="Where you’ll use it, like iPhone or Apple Watch."
        maxLength={60}
        autoFocus
      />
      {error && (
        <p role="alert" className="text-negative text-sm">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={create.isPending}>
        Create token
      </Button>
    </form>
  )
}
