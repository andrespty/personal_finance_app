import { Link } from 'react-router'

import { cn } from '@/lib/cn'
import { formatCents } from '@/lib/money'

import type { Account } from '../../types'

export type CreditCardProps = {
  account: Account
  /** Alternates card colors so neighbors are easy to tell apart. */
  tone?: 'green' | 'graphite'
  size?: 'md' | 'lg'
  to?: string
}

/** A credit card drawn as a physical card, showing what is owed. */
export function CreditCard({ account, tone = 'green', size = 'md', to }: CreditCardProps) {
  const owed = account.balanceCents
  const limit = account.credit_limit_cents
  const used = limit ? Math.min(100, Math.max(0, (owed / limit) * 100)) : null

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
      <div>
        <div className="flex justify-between text-xs opacity-65">
          <span>{limit ? `Limit ${formatCents(limit)}` : 'No limit set'}</span>
          {used !== null && <span>{used.toFixed(0)}% used</span>}
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/15">
          <div className="bg-card-fg h-full" style={{ width: `${used ?? 0}%` }} />
        </div>
      </div>
    </>
  )

  const className = cn(
    'flex aspect-[1.586] max-w-full flex-col justify-between rounded-2xl px-[18px] py-4 text-card-fg',
    'shadow-[0_12px_24px_-14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]',
    tone === 'green' ? 'bg-card-green' : 'bg-card-graphite',
    size === 'lg' ? 'w-full' : 'w-[260px] flex-none',
    to && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  )

  return to ? (
    <Link to={to} className={className} aria-label={`${account.name}, owed ${formatCents(owed)}`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
