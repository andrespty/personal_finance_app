import { useState } from 'react'

import { Button, EmptyState, LoadingBlock, PageHeader, Section, Sheet } from '@/components/ui'
import { AccountForm, AccountRow, CreditCard, isCard, useAccounts } from '@/features/accounts'
import { ActivityList } from '@/features/activity'
import { formatCents } from '@/lib/money'

export function DashboardPage() {
  const { data: accounts, isPending } = useAccounts()
  const [addingAccount, setAddingAccount] = useState(false)

  if (isPending) return <LoadingBlock />

  const cards = accounts?.filter(isCard) ?? []
  const bankAccounts = accounts?.filter((a) => !isCard(a)) ?? []
  const cash = bankAccounts.reduce((sum, a) => sum + a.balanceCents, 0)
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
          <section>
            <p className="text-muted text-sm">Cash</p>
            <p className="num mt-1 text-5xl leading-[1.05] font-semibold tracking-[-0.045em]">
              {formatCents(cash)}
            </p>
            {cards.length > 0 && (
              <p className="text-muted mt-1.5 text-sm">{formatCents(owed)} owed on cards</p>
            )}
          </section>

          {cards.length > 0 && (
            <div className="-mx-5 flex [scrollbar-width:none] gap-3 overflow-x-auto px-5 pt-0.5 pb-2.5">
              {cards.map((card, i) => (
                <CreditCard
                  key={card.id}
                  account={card}
                  tone={i % 2 === 0 ? 'green' : 'graphite'}
                  to={`/accounts/${card.id}`}
                />
              ))}
            </div>
          )}

          {bankAccounts.length > 0 && (
            <Section title="Accounts" action={{ label: 'See all', to: '/accounts' }}>
              {bankAccounts.map((account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </Section>
          )}

          <Section title="Recent" action={{ label: 'See all', to: '/activity' }}>
            <ActivityList limit={5} emptyText="Tap + to add your first transaction." />
          </Section>
        </>
      )}

      <Sheet open={addingAccount} onClose={() => setAddingAccount(false)} title="New account">
        <AccountForm onDone={() => setAddingAccount(false)} />
      </Sheet>
    </main>
  )
}
