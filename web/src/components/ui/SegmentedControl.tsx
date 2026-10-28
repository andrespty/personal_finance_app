import { cn } from '@/lib/cn'

export type Segment<T extends string> = { value: T; label: string }

export type SegmentedControlProps<T extends string> = {
  label: string
  value: T
  options: Segment<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="bg-fill flex rounded-xl p-[3px]">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 flex-1 rounded-[9px] text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-accent focus-visible:outline-2 disabled:opacity-50',
              selected ? 'bg-bg text-fg shadow-sm' : 'text-muted',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
