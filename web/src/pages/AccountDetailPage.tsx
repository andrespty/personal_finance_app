import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Button, EmptyState, LoadingBlock, PageHeader, Section, Sheet } from '@/components/ui'
import {
  AccountForm,
  accountTypeLabels,
  isCard,
  useAccount,
  useArchiveAccount,
  useDeleteAccount,
} from '@/features/accounts'
import { ActivityList, QuickAddSheet, type QuickAddMode } from '@/features/activity'
import { CoveredCardsSection, PayerCard, WhoPaysSection } from '@/features/card-payers'
import { useMoneyLeft } from '@/features/money-left'
import { errorMessage } from '@/lib/errors'
import { formatCents } from '@/lib/money'

export function AccountDetailPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { data: account, isPending } = useAccount(accountId)
  const archive = useArchiveAccount()
  const remove = useDeleteAccount()
  const { data: moneyLeft = [] } = useMoneyLeft()

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
        <PayerCard account={account} size="lg" />
      ) : (
        <BankSummary
          label={`${accountTypeLabels[account.type]} balance`}
          balanceCents={account.balanceCents}
          left={moneyLeft.find((m) => m.accountId === account.id)}
        />
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => setQuickAdd('transaction')}>
          {card ? 'Add charge' : 'Add transaction'}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setQuickAdd('transfer')}>
          {card ? 'Pay card' : 'Transfer'}
        </Button>
      </div>

      {card ? <WhoPaysSection card={account} /> : <CoveredCardsSection accountId={account.id} />}

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

function BankSummary({
  label,
  balanceCents,
  left,
}: {
  label: string
  balanceCents: number
  left?: { coversCents: number; moneyLeftCents: number }
}) {
  const covers = left?.coversCents ?? 0
  return (
    <section className="-mt-3">
      <p className="text-muted text-sm">{covers > 0 ? 'Money left' : label}</p>
      <p className="num mt-1 text-5xl leading-[1.05] font-semibold tracking-[-0.045em]">
        {formatCents(covers > 0 ? (left?.moneyLeftCents ?? balanceCents) : balanceCents)}
      </p>
      {covers > 0 && (
        <p className="text-muted mt-1.5 text-sm">
          {label} {formatCents(balanceCents)} · {formatCents(covers)} set aside for cards
        </p>
      )}
    </section>
  )
}
