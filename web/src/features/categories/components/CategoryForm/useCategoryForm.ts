import { useState, type FormEvent } from 'react'
import { errorMessage } from '@/lib/errors'
import { fieldErrors } from '@/lib/validation'

import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../api/categories.queries'
import { categoryFormSchema } from '../../schemas'
import type { Category } from '../../types'

export function useCategoryForm({
  category,
  defaultParentId,
  onDone,
}: {
  category?: Category
  defaultParentId?: string
  onDone: () => void
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [parentId, setParentId] = useState(category?.parent_id ?? defaultParentId ?? '')
  const [nameError, setNameError] = useState<string>()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const create = useCreateCategory()
  const update = useUpdateCategory()
  const remove = useDeleteCategory()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = categoryFormSchema.safeParse({ name, parentId })
    if (!parsed.success) {
      setNameError(fieldErrors<'name'>(parsed.error).name)
      return
    }
    setNameError(undefined)
    const input = { name: parsed.data.name, parent_id: parsed.data.parentId }
    try {
      if (category) await update.mutateAsync({ id: category.id, input })
      else await create.mutateAsync(input)
      onDone()
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  async function onDelete() {
    if (!category) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setFormError(null)
    try {
      await remove.mutateAsync(category.id)
      onDone()
    } catch (error) {
      setConfirmingDelete(false)
      setFormError(
        (error as { code?: string }).code === '23503'
          ? 'This category has subcategories or transactions. Move or delete those first.'
          : errorMessage(error),
      )
    }
  }

  return {
    isEdit: Boolean(category),
    name,
    setName,
    parentId,
    setParentId,
    nameError,
    formError,
    confirmingDelete,
    submitting: create.isPending || update.isPending || remove.isPending,
    onSubmit,
    onDelete,
  }
}
