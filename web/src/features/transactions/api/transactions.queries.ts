import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { accountKeys } from '@/features/accounts'

import type { TransactionFilters, TransactionInput } from '../types'

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './transactions.api'
import { transactionKeys } from './transactions.keys'

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => fetchTransactions(filters),
  })
}

/** Transactions change balances, so both caches refresh together. */
export function useInvalidateMoney() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
      queryClient.invalidateQueries({ queryKey: accountKeys.all }),
    ])
}

export function useCreateTransaction() {
  const invalidate = useInvalidateMoney()
  return useMutation({ mutationFn: createTransaction, onSuccess: invalidate })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateMoney()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      updateTransaction(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney()
  return useMutation({ mutationFn: deleteTransaction, onSuccess: invalidate })
}
