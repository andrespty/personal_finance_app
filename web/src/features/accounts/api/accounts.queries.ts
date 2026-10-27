import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Account, AccountInput } from '../types'

import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  setAccountArchived,
  updateAccount,
} from './accounts.api'
import { accountKeys } from './accounts.keys'

/** All accounts with balances. Archived accounts are left out unless asked for. */
export function useAccounts({ includeArchived = false } = {}) {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: fetchAccounts,
    select: (accounts: Account[]) =>
      includeArchived ? accounts : accounts.filter((a) => !a.archived),
  })
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: fetchAccounts,
    select: (accounts: Account[]) => accounts.find((a) => a.id === id) ?? null,
    enabled: Boolean(id),
  })
}

function useInvalidateAccounts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: accountKeys.all })
}

export function useCreateAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({ mutationFn: createAccount, onSuccess: invalidate })
}

export function useUpdateAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<AccountInput, 'type'> }) =>
      updateAccount(id, input),
    onSuccess: invalidate,
  })
}

export function useArchiveAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      setAccountArchived(id, archived),
    onSuccess: invalidate,
  })
}

export function useDeleteAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({ mutationFn: deleteAccount, onSuccess: invalidate })
}
