import { useMutation } from '@tanstack/react-query'

import { useInvalidateMoney } from '@/features/transactions'

import { createTransfer, deleteTransfer } from './transfers.api'

export function useCreateTransfer() {
  const invalidate = useInvalidateMoney()
  return useMutation({ mutationFn: createTransfer, onSuccess: invalidate })
}

export function useDeleteTransfer() {
  const invalidate = useInvalidateMoney()
  return useMutation({ mutationFn: deleteTransfer, onSuccess: invalidate })
}
