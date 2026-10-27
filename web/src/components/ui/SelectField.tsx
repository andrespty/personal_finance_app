import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { ChevronDownIcon } from './icons'
import { FieldShell, fieldBoxClass } from './TextField'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: ReactNode
  disabled?: boolean
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  hint,
  disabled,
}: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBoxClass, 'appearance-none pr-10', error && 'ring-negative ring-2')}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="text-muted pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
      </div>
    </FieldShell>
  )
}
