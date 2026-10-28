import type { ReactNode } from 'react'
import { Link } from 'react-router'

export type SectionAction = { label: string; to?: string; onClick?: () => void }

export type SectionProps = {
  title: string
  action?: SectionAction
  children: ReactNode
}

/** A titled group of hairline-separated rows. */
export function Section({ title, action, children }: SectionProps) {
  const actionClass =
    'text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent'
  return (
    <section className="flex flex-col">
      <div className="border-border flex items-baseline justify-between border-b pb-2">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action?.to ? (
          <Link to={action.to} className={actionClass}>
            {action.label}
          </Link>
        ) : action?.onClick ? (
          <button type="button" onClick={action.onClick} className={actionClass}>
            {action.label}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
}
