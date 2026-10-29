import { useState } from 'react'

import {
  Button,
  ChevronDownIcon,
  EmptyState,
  LoadingBlock,
  PageHeader,
  Section,
  Sheet,
} from '@/components/ui'
import {
  AccountForm,
  AccountPicker,
  isCard,
  pinnedAccountOf,
  useAccounts,
  CreditCard,
} from '@/features/accounts'
import { MoneyLeftRow, useMoneyLeft } from '@/features/money-left'
import { useProfile, useUpdateProfile } from '@/features/profile'
import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

export function DashboardPage() {
  const { data: accounts, isPending } = useAccounts()
  const { data: moneyLeft = [] } = useMoneyLeft()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const [addingAccount, setAddingAccount] = useState(false)
  const [pickingPinned, setPickingPinned] = useState(false)

  if (isPending) return <LoadingBlock />

  const cards = accounts?.filter(isCard) ?? []
  const bankAccounts = accounts?.filter((a) => !isCard(a)) ?? []
  const leftFor = (id: string) => moneyLeft.find((m) => m.accountId === id)
  const pinned = pinnedAccountOf(bankAccounts, profile?.pinned_account_id)
  const otherAccounts = bankAccounts.filter((a) => a !== pinned)
  const owed = cards.reduce((sum, a) => sum + a.balanceCents, 0)

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />

      {accounts?.length === 0 ? (
        <EmptyState
          title="Add your first account"
          body="Start with the checking account you use most. You can add savings and cards after."
          action={<Button onClick={() => setAddingAccount(true)}>Add account</Button>}
        />
      ) : (
        <>
          <section className="flex items-start gap-4">
            {pinned && (
              <div className="min-w-0">
                {bankAccounts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPickingPinned(true)}
                    aria-label={`${pinned.name}. Change account`}
                    className="text-muted focus-visible:outline-accent flex max-w-full items-center gap-1 text-sm focus-visible:outline-2"
                  >
                    <span className="truncate">{pinned.name}</span>
                    <ChevronDownIcon className="size-3.5 flex-none" />
                  </button>
                ) : (
                  <p className="text-muted truncate text-sm">{pinned.name}</p>
                )}
                <p className="num mt-1 text-[40px] leading-[1.05] font-semibold tracking-[-0.045em]">
                  {formatCents(leftFor(pinned.id)?.moneyLeftCents ?? pinned.balanceCents)}
                </p>
                <p className="text-muted mt-1.5 text-sm">Money left</p>
              </div>
            )}
            {cards.length > 0 && (
              <div className={cn('flex-none', pinned && 'ml-auto text-right')}>
                <p className="text-muted text-sm">Owed on cards</p>
                <p
                  className={cn(
                    'num mt-1 font-semibold tracking-[-0.03em]',
                    pinned ? 'text-2xl' : 'text-[40px] leading-[1.05] tracking-[-0.045em]',
                    owed > 0 && 'text-negative',
                  )}
                >
                  {formatCents(owed)}
                </p>
                <p className="text-muted mt-1.5 text-sm">
                  {cards.length === 1 ? '1 card' : `${cards.length} cards`}
                </p>
              </div>
            )}
          </section>

          {cards.length > 0 && (
            <div className="-mx-5 flex [scrollbar-width:none] gap-3 overflow-x-auto px-5 pt-0.5 pb-2.5">
              {cards.map((card) => (
                <CreditCard key={card.id} account={card} to={`/accounts/${card.id}`} />
              ))}
            </div>
          )}

          {otherAccounts.length > 0 && (
            <Section title="Accounts" action={{ label: 'See all', to: '/accounts' }}>
              {otherAccounts.map((account) => (
                <MoneyLeftRow key={account.id} account={account} moneyLeft={leftFor(account.id)} />
              ))}
            </Section>
          )}
        </>
      )}

      <Sheet open={addingAccount} onClose={() => setAddingAccount(false)} title="New account">
        <AccountForm onDone={() => setAddingAccount(false)} />
      </Sheet>

      <Sheet open={pickingPinned} onClose={() => setPickingPinned(false)} title="Show on dashboard">
        <AccountPicker
          label="Account"
          accounts={bankAccounts}
          selectedId={pinned?.id}
          onSelect={(account) => {
            updateProfile.mutate({ pinned_account_id: account.id })
            setPickingPinned(false)
          }}
        />
      </Sheet>
    </main>
  )
}
