import { Button, SelectField, TextField } from '@/components/ui'

import { useCategories } from '../../api/categories.queries'
import type { Category } from '../../types'

import { useCategoryForm } from './useCategoryForm'

export type CategoryFormProps = {
  category?: Category
  defaultParentId?: string
  onDone: () => void
}

export function CategoryForm({ category, defaultParentId, onDone }: CategoryFormProps) {
  const form = useCategoryForm({ category, defaultParentId, onDone })
  const { data: categories = [] } = useCategories()

  const hasChildren = category ? categories.some((c) => c.parent_id === category.id) : false
  const parentOptions = [
    { value: '', label: 'None (top level)' },
    ...categories
      .filter((c) => c.parent_id === null && c.id !== category?.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <TextField
          label="Name"
          value={form.name}
          onChange={form.setName}
          error={form.nameError}
          autoFocus={!form.isEdit}
        />
        <SelectField
          label="Inside"
          value={form.parentId}
          onChange={form.setParentId}
          options={parentOptions}
          disabled={hasChildren}
          hint={hasChildren ? 'Categories with subcategories stay at the top level.' : undefined}
        />
      </div>
      {form.formError && (
        <p role="alert" className="text-negative text-sm">
          {form.formError}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={form.submitting}>
        {form.isEdit ? 'Save' : 'Add category'}
      </Button>
      {form.isEdit && (
        <Button
          variant="ghost"
          fullWidth
          onClick={form.onDelete}
          disabled={form.submitting}
          className="text-negative"
        >
          {form.confirmingDelete ? 'Tap again to delete' : 'Delete category'}
        </Button>
      )}
    </form>
  )
}
