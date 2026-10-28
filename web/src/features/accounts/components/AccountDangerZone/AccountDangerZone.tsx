import { useState } from 'react'

import { Button } from '@/components/ui'
import { errorMessage } from '@/lib/errors'

import { useArchiveAccount, useDeleteAccount } from '../../api/accounts.queries'
import type { Account } from '../../types'

/** Archive or delete an account. Lives at the bottom of the Edit sheet. */
export function AccountDangerZone({
  account,
  onDeleted,
}: {
  account: Account
  onDeleted: () => void
}) {
  const archive = useArchiveAccount()
  const remove = useDeleteAccount()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setError(null)
    try {
      await remove.mutateAsync(account.id)
      onDeleted()
    } catch (e) {
      setConfirmingDelete(false)
      setError(
        (e as { code?: string }).code === '23503'
          ? 'This account has transactions, so it can’t be deleted. Archive it instead.'
          : errorMessage(e),
      )
    }
  }

  return (
    <section className="border-border flex flex-col gap-2 border-t pt-4">
      <p className="text-muted text-sm">
        {account.archived
          ? 'Archived accounts are hidden from the dashboard and pickers.'
          : 'Archiving hides the account but keeps its history.'}
      </p>
      {error && (
        <p role="alert" className="text-negative text-sm">
          {error}
        </p>
      )}
      <Button
        variant="secondary"
        onClick={() => archive.mutate({ id: account.id, archived: !account.archived })}
        disabled={archive.isPending}
      >
        {account.archived ? 'Unarchive account' : 'Archive account'}
      </Button>
      <Button
        variant="ghost"
        className="text-negative"
        onClick={onDelete}
        disabled={remove.isPending}
      >
        {confirmingDelete ? 'Tap again to delete' : 'Delete account'}
      </Button>
    </section>
  )
}
