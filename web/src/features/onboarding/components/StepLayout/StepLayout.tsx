import type { ReactNode } from 'react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export type StepAction = { label: string; onClick: () => void; disabled?: boolean }

export type StepLayoutProps = {
  index: number
  total: number
  title: string
  description: string
  children?: ReactNode
  primary: StepAction
  secondary?: StepAction
  error?: string | null
}

/** Shared frame for every setup step: progress, heading, content, actions. */
export function StepLayout({
  index,
  total,
  title,
  description,
  children,
  primary,
  secondary,
  error,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col gap-7">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-accent' : 'bg-fill')}
          />
        ))}
      </div>
      <header className="flex flex-col gap-2">
        <p className="text-muted text-sm">
          Step {index + 1} of {total}
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="text-muted text-[15px]">{description}</p>
      </header>
      {children}
      <div className="border-border bg-bg sticky bottom-0 -mx-5 flex flex-col gap-2 border-t px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        {error && (
          <p role="alert" className="text-negative text-sm">
            {error}
          </p>
        )}
        <Button size="lg" fullWidth onClick={primary.onClick} disabled={primary.disabled}>
          {primary.label}
        </Button>
        {secondary && (
          <Button
            variant="ghost"
            fullWidth
            onClick={secondary.onClick}
            disabled={secondary.disabled}
          >
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  )
}
