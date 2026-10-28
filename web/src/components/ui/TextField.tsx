import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: ReactNode
}

export const fieldBoxClass =
  'h-12 w-full rounded-xl bg-fill px-3.5 text-[15px] text-fg outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50'

export function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-muted text-sm">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-negative text-sm">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted text-sm">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  className,
  id,
  ...props
}: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint}>
      <input
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(fieldBoxClass, error && 'ring-negative ring-2', className)}
        {...props}
      />
    </FieldShell>
  )
}
