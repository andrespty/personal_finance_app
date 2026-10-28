import { useState } from 'react'

import { Button, EmptyState, LoadingBlock, PageHeader, Section, Sheet } from '@/components/ui'
import {
  AccountForm,
  accountGroupTitles,
  AccountRow,
  groupAccounts,
  useAccounts,
} from '@/features/accounts'

export function AccountsPage() {
  const { data: accounts = [], isPending } = useAccounts({ includeArchived: true })
  const [adding, setAdding] = useState(false)

  const active = accounts.filter((a) => !a.archived)
  const archived = accounts.filter((a) => a.archived)

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        action={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-accent focus-visible:outline-accent font-medium focus-visible:outline-2"
          >
            Add
          </button>
        }
      />

      {isPending ? (
        <LoadingBlock />
      ) : active.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          body="Add checking and savings accounts, and the credit cards they pay."
          action={<Button onClick={() => setAdding(true)}>Add account</Button>}
        />
      ) : (
        groupAccounts(active).map((group) => (
          <Section key={group.type} title={accountGroupTitles[group.type]}>
            {group.accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </Section>
        ))
      )}

      {archived.length > 0 && (
        <Section title="Archived">
          {archived.map((account) => (
            <AccountRow key={account.id} account={account} />
          ))}
        </Section>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="New account">
        <AccountForm onDone={() => setAdding(false)} />
      </Sheet>
    </main>
  )
}
