import { useState } from 'react'

import { Button, EmptyState, LoadingBlock, PageHeader, Sheet } from '@/components/ui'
import {
  buildCategoryTree,
  CategoryForm,
  CategoryList,
  useCategories,
  type Category,
} from '@/features/categories'

type SheetState = { mode: 'add'; parentId?: string } | { mode: 'edit'; category: Category } | null

export function CategoriesPage() {
  const { data: categories = [], isPending } = useCategories()
  const [sheet, setSheet] = useState<SheetState>(null)
  const close = () => setSheet(null)

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        back={{ label: 'Settings', to: '/settings' }}
        action={
          <button
            type="button"
            onClick={() => setSheet({ mode: 'add' })}
            className="text-accent focus-visible:outline-accent font-medium focus-visible:outline-2"
          >
            Add
          </button>
        }
      />

      {isPending ? (
        <LoadingBlock />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          body="Card transactions need a category. Start with a few, like Food or Shopping."
          action={<Button onClick={() => setSheet({ mode: 'add' })}>Add category</Button>}
        />
      ) : (
        <CategoryList
          tree={buildCategoryTree(categories)}
          onSelect={(category) => setSheet({ mode: 'edit', category })}
          onAddSubcategory={(parent) => setSheet({ mode: 'add', parentId: parent.id })}
        />
      )}

      <Sheet
        open={sheet !== null}
        onClose={close}
        title={sheet?.mode === 'edit' ? 'Edit category' : 'New category'}
      >
        {sheet?.mode === 'edit' ? (
          <CategoryForm category={sheet.category} onDone={close} />
        ) : (
          <CategoryForm defaultParentId={sheet?.parentId} onDone={close} />
        )}
      </Sheet>
    </main>
  )
}
