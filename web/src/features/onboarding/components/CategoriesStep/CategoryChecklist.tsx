import { cn } from '@/lib/cn'

import type { SelectionItem } from '../../utils/categorySelection'

type CheckRowProps = {
  name: string
  checked: boolean
  onToggle: () => void
  onRename: (name: string) => void
  autoFocus: boolean
  indent?: boolean
  placeholder: string
}

function CheckRow({
  name,
  checked,
  onToggle,
  onRename,
  autoFocus,
  indent,
  placeholder,
}: CheckRowProps) {
  return (
    <div className={cn('border-border flex items-center gap-3 border-b py-2.5', indent && 'pl-8')}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Include ${name || 'new category'}`}
        onClick={onToggle}
        className={cn(
          'grid size-[22px] flex-none place-items-center rounded-full border-[1.5px] transition-colors duration-150',
          'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
          checked ? 'border-accent bg-accent text-on-accent' : 'border-border',
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <input
        value={name}
        onChange={(e) => onRename(e.target.value)}
        aria-label="Category name"
        placeholder={placeholder}
        maxLength={40}
        autoFocus={autoFocus}
        className={cn(
          'placeholder:text-muted focus-visible:bg-fill min-w-0 flex-1 rounded-md bg-transparent py-1 text-[15px] outline-none focus-visible:px-2',
          !indent && 'font-medium',
          !checked && 'text-muted decoration-muted/60 line-through',
        )}
      />
    </div>
  )
}

export type CategoryChecklistProps = {
  items: SelectionItem[]
  focusKey: string | null
  onToggleParent: (key: string) => void
  onToggleChild: (parentKey: string, childKey: string) => void
  onRename: (key: string, name: string) => void
  onAddChild: (parentKey: string) => void
  onAddParent: () => void
}

/** Pick, rename and add categories. Tap a name to edit it. */
export function CategoryChecklist({
  items,
  focusKey,
  onToggleParent,
  onToggleChild,
  onRename,
  onAddChild,
  onAddParent,
}: CategoryChecklistProps) {
  const linkClass =
    'py-2.5 text-left text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent'
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div key={item.key} className="flex flex-col">
          <CheckRow
            name={item.name}
            checked={item.checked}
            onToggle={() => onToggleParent(item.key)}
            onRename={(name) => onRename(item.key, name)}
            autoFocus={focusKey === item.key}
            placeholder="Category name"
          />
          {item.children.map((child) => (
            <CheckRow
              key={child.key}
              name={child.name}
              checked={child.checked}
              onToggle={() => onToggleChild(item.key, child.key)}
              onRename={(name) => onRename(child.key, name)}
              autoFocus={focusKey === child.key}
              placeholder="Subcategory name"
              indent
            />
          ))}
          {item.checked && (
            <button
              type="button"
              onClick={() => onAddChild(item.key)}
              className={cn(linkClass, 'border-border border-b pl-8')}
            >
              Add to {item.name || 'this category'}
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAddParent} className={linkClass}>
        Add a category
      </button>
    </div>
  )
}
