import { ListRow } from '@/components/ui'
import { cn } from '@/lib/cn'

import type { TransactionDisplay } from '../../utils/describeTransaction'

export function TransactionRow({
  display,
  onClick,
}: {
  display: TransactionDisplay
  onClick?: () => void
}) {
  return (
    <ListRow
      title={display.title}
      subtitle={display.detail}
      onClick={onClick}
      trailing={
        <span
          className={cn(
            'num text-[15px] font-semibold whitespace-nowrap',
            display.tone === 'positive' && 'text-positive',
          )}
        >
          {display.amount}
        </span>
      }
    />
  )
}
