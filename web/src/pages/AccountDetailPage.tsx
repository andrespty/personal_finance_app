import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  Button,
  EmptyState,
  LoadingBlock,
  PageHeader,
  SegmentedControl,
  Sheet,
  type Segment,
} from '@/components/ui'
import {
  AccountDangerZone,
  AccountForm,
  accountTypeLabels,
  isCard,
  useAccount,
  CreditCard,
} from '@/features/accounts'
import { ActivityList, QuickAddSheet, type QuickAddMode } from '@/features/activity'
import { CategorySpendingPanel, CoveredCardsPanel, WhoPaysPanel } from '@/features/card-payers'
import { useMoneyLeft } from '@/features/money-left'
import { formatCents } from '@/lib/money'

type Tab = 'transactions' | 'categories' | 'payers' | 'cards'

const cardTabs: Segment<Tab>[] = [
  { value: 'transactions', label: 'Transactions' },
  { value: 'categories', label: 'Categories' },
  { value: 'payers', label: 'Who pays' },
]

const bankTabs: Segment<Tab>[] = [
  { value: 'transactions', label: 'Transactions' },
  { value: 'cards', label: 'For cards' },
]

export function AccountDetailPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { data: account, isPending } = useAccount(accountId)
  const { data: moneyLeft = [] } = useMoneyLeft()

  const [tab, setTab] = useState<Tab>('transactions')
  const [editing, setEditing] = useState(false)
  const [quickAdd, setQuickAdd] = useState<QuickAddMode | null>(null)

  if (isPending) return <LoadingBlock />
  if (!account) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Account not found" back={{ label: 'Accounts', to: '/accounts' }} />
      </main>
    )
  }

  const card = isCard(account)

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

      {account.archived && (
        <EmptyState
          title="This account is archived."
          body="It’s hidden from the dashboard and pickers."
        />
      )}

      {card ? (
        <CreditCard account={account} size="lg" />
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

      <div className="flex flex-col gap-2">
        <SegmentedControl
          label="Show"
          value={tab}
          options={card ? cardTabs : bankTabs}
          onChange={setTab}
        />
        {tab === 'transactions' && (
          <ActivityList
            accountId={account.id}
            groupByDay
            emptyText="No transactions on this account yet."
          />
        )}
        {tab === 'categories' && card && <CategorySpendingPanel card={account} />}
        {tab === 'payers' && card && <WhoPaysPanel card={account} />}
        {tab === 'cards' && !card && <CoveredCardsPanel accountId={account.id} />}
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit account">
        <div className="flex flex-col gap-6">
          <AccountForm account={account} onDone={() => setEditing(false)} />
          <AccountDangerZone
            account={account}
            onDeleted={() => navigate('/accounts', { replace: true })}
          />
        </div>
      </Sheet>
      <QuickAddSheet
        open={quickAdd !== null}
        onClose={() => setQuickAdd(null)}
        initialMode={quickAdd ?? 'transaction'}
        defaultAccountId={account.id}
        defaultToId={card ? account.id : undefined}
      />
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
