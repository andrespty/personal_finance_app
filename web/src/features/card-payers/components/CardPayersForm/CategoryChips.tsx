import { buildCategoryTree, type Category } from '@/features/categories'
import { cn } from '@/lib/cn'

export type CategoryChipsProps = {
  categories: Category[]
  selected: string[]
  onToggle: (categoryId: string) => void
  /** Name of the account that already pays for a category, if another one does. */
  claimedBy: (categoryId: string) => string | null
}

/** Tappable category chips, grouped by parent. */
export function CategoryChips({ categories, selected, onToggle, claimedBy }: CategoryChipsProps) {
  return (
    <div className="flex flex-col gap-3">
      {buildCategoryTree(categories).map((parent) => (
        <div key={parent.id} className="flex flex-wrap gap-1.5">
          {[parent, ...parent.children].map((category) => {
            const isSelected = selected.includes(category.id)
            const owner = claimedBy(category.id)
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isSelected}
                disabled={owner !== null}
                title={owner ? `Paid by ${owner}` : undefined}
                onClick={() => onToggle(category.id)}
                className={cn(
                  'h-8 rounded-full px-3 text-[13px] font-medium transition-colors duration-150',
                  'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-1',
                  'disabled:opacity-35',
                  category.parent_id === null && 'font-semibold',
                  isSelected ? 'bg-accent text-on-accent' : 'bg-fill text-fg',
                )}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
