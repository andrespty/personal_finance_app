import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CategoryInput } from '../types'

import { createCategory, deleteCategory, fetchCategories, updateCategory } from './categories.api'
import { categoryKeys } from './categories.keys'

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.all, queryFn: fetchCategories })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: createCategory, onSuccess: invalidate })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: deleteCategory, onSuccess: invalidate })
}
