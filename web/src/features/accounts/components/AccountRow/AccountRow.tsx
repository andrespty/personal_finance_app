import { ListRow } from '@/components/ui'
import { formatCents } from '@/lib/money'

import type { Account } from '../../types'
import { accountTypeLabels, isCard } from '../../utils/accountType'

export function AccountRow({ account }: { account: Account }) {
  return (
    <ListRow
      to={`/accounts/${account.id}`}
      title={account.name}
      subtitle={account.archived ? 'Archived' : accountTypeLabels[account.type]}
      trailing={
        <div className="num text-right text-[15px] font-semibold whitespace-nowrap">
          {formatCents(account.balanceCents)}
          {isCard(account) && <div className="text-muted text-xs font-normal">owed</div>}
        </div>
      }
    />
  )
}
