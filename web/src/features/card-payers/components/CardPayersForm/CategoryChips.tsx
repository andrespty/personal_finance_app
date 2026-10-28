import { buildCategoryTree, type Category } from '@/features/categories'
import { cn } from '@/lib/cn'

import { isPicked, toggleChild, toggleParent } from '../../utils/chipSelection'

export type CategoryChipsProps = {
  categories: Category[]
  picked: string[]
  onChange: (picked: string[]) => void
  /** Name of the account that already pays for a category, if another one does. */
  claimedBy: (categoryId: string) => string | null
}

/** Category chips grouped by parent. Tapping a parent picks the whole group. */
export function CategoryChips({ categories, picked, onChange, claimedBy }: CategoryChipsProps) {
  return (
    <div className="border-border flex flex-col border-t">
      {buildCategoryTree(categories).map((group) => (
        <div key={group.id} className="border-border flex flex-col gap-2 border-b py-3">
          <Chip
            label={group.name}
            parent
            on={picked.includes(group.id)}
            owner={claimedBy(group.id)}
            onClick={() => onChange(toggleParent(picked, group))}
          />
          {group.children.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-4">
              {group.children.map((child) => (
                <Chip
                  key={child.id}
                  label={child.name}
                  on={isPicked(picked, child.id, group.id)}
                  owner={claimedBy(child.id)}
                  onClick={() => onChange(toggleChild(picked, group, child.id))}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Chip({
  label,
  on,
  owner,
  parent = false,
  onClick,
}: {
  label: string
  on: boolean
  owner: string | null
  parent?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={owner !== null}
      title={owner ? `Paid by ${owner}` : undefined}
      onClick={onClick}
      className={cn(
        'h-8 rounded-full px-3 text-[13px] transition-colors duration-150',
        'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-1',
        'disabled:opacity-35',
        parent ? 'self-start font-semibold' : 'font-medium',
        on ? 'bg-accent text-on-accent' : 'bg-fill text-fg',
      )}
    >
      {label}
    </button>
  )
}
