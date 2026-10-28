import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'border-border border-t-muted inline-block size-5 animate-spin rounded-full border-2',
        className,
      )}
    />
  )
}

/** Centered spinner for a page or section that is still loading. */
export function LoadingBlock() {
  return (
    <div className="flex justify-center py-16">
      <Spinner />
    </div>
  )
}
