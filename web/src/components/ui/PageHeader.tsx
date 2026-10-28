import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { ChevronLeftIcon } from './icons'

export type PageHeaderProps = {
  title: string
  back?: { label: string; to: string }
  action?: ReactNode
  /** Keep the title for screen readers but don't show it. */
  hideTitle?: boolean
}

export function PageHeader({ title, back, action, hideTitle = false }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      {(back || action) && (
        <div className="flex min-h-6 items-center justify-between text-[15px]">
          {back ? (
            <Link
              to={back.to}
              className="text-accent focus-visible:outline-accent -ml-1 flex items-center font-medium focus-visible:outline-2"
            >
              <ChevronLeftIcon className="size-5" />
              {back.label}
            </Link>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <h1 className={hideTitle ? 'sr-only' : 'text-[28px] font-semibold tracking-[-0.03em]'}>
        {title}
      </h1>
    </header>
  )
}
