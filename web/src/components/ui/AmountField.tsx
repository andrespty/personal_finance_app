import { useId } from 'react'

import { cn } from '@/lib/cn'

export type AmountFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoFocus?: boolean
}

/** Large dollar amount input. Values are plain strings; parse with parseAmount. */
export function AmountField({ label, value, onChange, error, autoFocus }: AmountFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="num flex items-baseline text-[56px] leading-none font-semibold tracking-[-0.05em]">
        <span className="text-muted font-medium">$</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
          aria-invalid={error ? true : undefined}
          className={cn(
            'placeholder:text-border w-full min-w-0 bg-transparent outline-none',
            error && 'text-negative',
          )}
        />
      </div>
      {error && <p className="text-negative text-sm">{error}</p>}
    </div>
  )
}
