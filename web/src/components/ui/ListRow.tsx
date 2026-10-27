import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/cn'

export type ListRowProps = {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  to?: string
  onClick?: () => void
  className?: string
}

/** One row in a Section. Renders a link, a button or a plain row. */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  to,
  onClick,
  className,
}: ListRowProps) {
  const content = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium">{title}</div>
        {subtitle && <div className="text-muted mt-0.5 truncate text-[13px]">{subtitle}</div>}
      </div>
      {trailing}
    </>
  )
  const rowClass = cn(
    'flex w-full items-center gap-3 border-b border-border py-3.5 text-left',
    (to || onClick) && 'focus-visible:outline-2 focus-visible:outline-accent active:opacity-70',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={rowClass}>
        {content}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {content}
      </button>
    )
  }
  return <div className={rowClass}>{content}</div>
}

/** Round outlined icon used as a ListRow's leading element. */
export function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="border-border grid size-[34px] flex-none place-items-center rounded-full border [&>svg]:size-4">
      {children}
    </span>
  )
}
