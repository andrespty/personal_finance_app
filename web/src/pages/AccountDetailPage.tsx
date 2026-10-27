import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Button, EmptyState, LoadingBlock, PageHeader, Section, Sheet } from '@/components/ui'
import {
  AccountForm,
  accountTypeLabels,
  CreditCard,
  isCard,
  useAccount,
  useArchiveAccount,
  useDeleteAccount,
} from '@/features/accounts'
import { ActivityList, QuickAddSheet, type QuickAddMode } from '@/features/activity'
import { errorMessage } from '@/lib/errors'
import { formatCents } from '@/lib/money'

export function AccountDetailPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { data: account, isPending } = useAccount(accountId)
  const archive = useArchiveAccount()
  const remove = useDeleteAccount()

  const [editing, setEditing] = useState(false)
  const [quickAdd, setQuickAdd] = useState<QuickAddMode | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isPending) return <LoadingBlock />
  if (!account) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Account not found" back={{ label: 'Accounts', to: '/accounts' }} />
      </main>
    )
  }

  const card = isCard(account)

  async function onDelete() {
    if (!account) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setError(null)
    try {
      await remove.mutateAsync(account.id)
      navigate('/accounts', { replace: true })
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
    <main className="flex flex-col gap-6">
      <PageHeader
        title={account.name}
        hideTitle={card}
        back={{ label: 'Accounts', to: '/accounts' }}
        action={
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-accent focus-visible:outline-accent font-medium focus-visible:outline-2"
          >
            Edit
          </button>
        }
      />

      {card ? (
        <CreditCard account={account} size="lg" />
      ) : (
        <section className="-mt-3">
          <p className="text-muted text-sm">{accountTypeLabels[account.type]} balance</p>
          <p className="num mt-1 text-5xl leading-[1.05] font-semibold tracking-[-0.045em]">
            {formatCents(account.balanceCents)}
          </p>
        </section>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => setQuickAdd('transaction')}>
          {card ? 'Add charge' : 'Add transaction'}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setQuickAdd('transfer')}>
          {card ? 'Pay card' : 'Transfer'}
        </Button>
      </div>

      <Section title="Transactions">
        <ActivityList
          accountId={account.id}
          groupByDay
          emptyText="No transactions on this account yet."
        />
      </Section>

      <section className="flex flex-col gap-2">
        {error && (
          <p role="alert" className="text-negative text-sm">
            {error}
          </p>
        )}
        <Button
          variant="ghost"
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

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit account">
        <AccountForm account={account} onDone={() => setEditing(false)} />
      </Sheet>
      <QuickAddSheet
        open={quickAdd !== null}
        onClose={() => setQuickAdd(null)}
        initialMode={quickAdd ?? 'transaction'}
        defaultAccountId={account.id}
        defaultToId={card ? account.id : undefined}
      />
      {account.archived && (
        <EmptyState
          title="This account is archived."
          body="It’s hidden from the dashboard and pickers."
        />
      )}
    </main>
  )
}
