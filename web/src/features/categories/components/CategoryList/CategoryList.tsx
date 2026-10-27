import { ChevronRightIcon, ListRow } from '@/components/ui'

import type { Category, CategoryNode } from '../../types'

export type CategoryListProps = {
  tree: CategoryNode[]
  onSelect: (category: Category) => void
  onAddSubcategory: (parent: Category) => void
}

export function CategoryList({ tree, onSelect, onAddSubcategory }: CategoryListProps) {
  return (
    <div className="flex flex-col">
      {tree.map((parent) => (
        <div key={parent.id} className="flex flex-col">
          <ListRow
            title={parent.name}
            subtitle={
              parent.children.length === 1
                ? '1 subcategory'
                : `${parent.children.length} subcategories`
            }
            onClick={() => onSelect(parent)}
            trailing={<ChevronRightIcon className="text-muted size-4" />}
          />
          {parent.children.map((child) => (
            <ListRow
              key={child.id}
              title={child.name}
              onClick={() => onSelect(child)}
              className="pl-5"
              trailing={<ChevronRightIcon className="text-muted size-4" />}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddSubcategory(parent)}
            className="border-border text-accent focus-visible:outline-accent border-b py-3 pl-5 text-left text-sm font-medium focus-visible:outline-2"
          >
            Add to {parent.name}
          </button>
        </div>
      ))}
    </div>
  )
}
