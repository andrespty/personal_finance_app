import type { Account } from '../../types'

export type AccountPickerProps = {
  label: string
  accounts: Account[]
  selectedId?: string
  onSelect: (account: Account) => void
}

/** A list of accounts to choose one from, with the current one checked. */
export function AccountPicker({ label, accounts, selectedId, onSelect }: AccountPickerProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col">
      {accounts.map((account) => {
        const selected = account.id === selectedId
        return (
          <button
            key={account.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(account)}
            className="border-border focus-visible:outline-accent flex w-full items-center gap-3 border-b py-3.5 text-left focus-visible:outline-2 active:opacity-70"
          >
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{account.name}</span>
            {selected && (
              <span className="text-accent text-[15px] font-semibold" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
