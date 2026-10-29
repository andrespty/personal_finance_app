import { cn } from '@/lib/cn'

import { cardColorKeys, cardColors, type CardColor } from '../../utils/cardColors'

export type CardColorPickerProps = {
  value: CardColor
  onChange: (value: CardColor) => void
}

/** Round swatches for a card's color, with the chosen name underneath. */
export function CardColorPicker({ value, onChange }: CardColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span id="card-color-label" className="text-muted text-sm">
        Color
      </span>
      <div role="radiogroup" aria-labelledby="card-color-label" className="flex flex-wrap gap-2.5">
        {cardColorKeys.map((key) => {
          const selected = key === value
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={cardColors[key].label}
              title={cardColors[key].label}
              onClick={() => onChange(key)}
              className={cn(
                'grid size-9 place-items-center rounded-full',
                'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-4',
                selected
                  ? 'ring-offset-bg ring-fg ring-2 ring-offset-2'
                  : 'ring-1 ring-black/10 ring-inset',
              )}
              style={{ background: cardColors[key].bg, color: cardColors[key].fg }}
            >
              {selected && (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
      <span className="text-sm">{cardColors[value].label}</span>
    </div>
  )
}
