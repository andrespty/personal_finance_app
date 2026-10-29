import type { CSSProperties } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

import type { Account } from '../../types'
import { cardColorOf, cardColors } from '../../utils/cardColors'

export type CreditCardProps = {
  account: Account
  size?: 'md' | 'lg'
  to?: string
}

/** A credit card drawn as a physical card, showing what is owed. */
export function CreditCard({ account, size = 'md', to }: CreditCardProps) {
  const owed = account.balanceCents
  const color = cardColors[cardColorOf(account.card_color)]
  // Colors come from the card's own palette; .credit-card switches to the
  // lifted shade in dark mode.
  const style = {
    '--cc-bg': color.bg,
    '--cc-bg-dark': color.bgDark,
    '--cc-track': color.track,
    color: color.fg,
  } as CSSProperties

  const body = (
    <>
      <div className="flex items-center justify-between text-[15px] font-semibold">
        <span className="truncate">{account.name}</span>
        {account.alias && (
          <span className="text-[13px] font-medium opacity-65">{account.alias}</span>
        )}
      </div>
      <div>
        <div className="text-xs opacity-65">Owed</div>
        <div
          className={cn(
            'num font-semibold tracking-[-0.03em]',
            size === 'lg' ? 'text-[32px]' : 'text-[26px]',
          )}
        >
          {formatCents(owed)}
        </div>
      </div>
      <LimitBar account={account} />
    </>
  )

  const className = cn(
    'credit-card flex aspect-[1.586] max-w-full flex-col justify-between rounded-2xl px-[18px] py-4',
    'shadow-[0_12px_24px_-14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]',
    size === 'lg' ? 'w-full' : 'w-[260px] flex-none',
    to && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  )

  return to ? (
    <Link
      to={to}
      className={className}
      style={style}
      aria-label={`${account.name}, owed ${formatCents(owed)}`}
    >
      {body}
    </Link>
  ) : (
    <div className={className} style={style}>
      {body}
    </div>
  )
}

/** How much of the credit limit is used. Shows nothing when no limit is set. */
function LimitBar({ account }: { account: Account }) {
  const limit = account.credit_limit_cents
  if (!limit) return <div />
  const used = Math.min(100, Math.max(0, (account.balanceCents / limit) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs opacity-65">
        <span>Limit {formatCents(limit)}</span>
        <span>{used.toFixed(0)}% used</span>
      </div>
      <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-(--cc-track)">
        <div className="h-full bg-current" style={{ width: `${used}%` }} />
      </div>
    </div>
  )
}
