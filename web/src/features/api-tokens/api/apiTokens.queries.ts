import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApiToken, fetchApiTokens, revokeApiToken } from './apiTokens.api'
import { apiTokenKeys } from './apiTokens.keys'

export function useApiTokens() {
  return useQuery({ queryKey: apiTokenKeys.all, queryFn: fetchApiTokens })
}

function useInvalidateTokens() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: apiTokenKeys.all })
}

export function useCreateApiToken() {
  const invalidate = useInvalidateTokens()
  return useMutation({ mutationFn: createApiToken, onSuccess: invalidate })
}

export function useRevokeApiToken() {
  const invalidate = useInvalidateTokens()
  return useMutation({ mutationFn: revokeApiToken, onSuccess: invalidate })
}
