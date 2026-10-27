import type { ReactNode } from 'react'

export type EmptyStateProps = {
  title: string
  body?: string
  action?: ReactNode
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 py-6">
      <p className="text-[15px] font-medium">{title}</p>
      {body && <p className="text-muted text-sm">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
