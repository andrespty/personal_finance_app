import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { accountKeys } from '@/features/accounts'

import type { PayerSetup, PayerShare } from '../types'

import {
  fetchCardSpending,
  fetchPayerSetups,
  fetchPayerShares,
  saveCardPayers,
} from './cardPayers.api'
import { cardPayerKeys } from './cardPayers.keys'

export function usePayerSetups() {
  return useQuery({ queryKey: cardPayerKeys.setups, queryFn: fetchPayerSetups })
}

/** One card's setup; an empty setup when it has none yet. */
export function usePayerSetup(cardId: string) {
  return useQuery({
    queryKey: cardPayerKeys.setups,
    queryFn: fetchPayerSetups,
    select: (setups: PayerSetup[]) =>
      setups.find((s) => s.cardId === cardId) ?? { cardId, defaultPayerId: null, rules: [] },
  })
}

export function usePayerShares(filter?: (share: PayerShare) => boolean) {
  return useQuery({
    queryKey: cardPayerKeys.shares,
    queryFn: fetchPayerShares,
    select: (shares: PayerShare[]) => (filter ? shares.filter(filter) : shares),
  })
}

export function useCardSpending(cardId: string, since: string) {
  return useQuery({
    queryKey: cardPayerKeys.spending(cardId, since),
    queryFn: () => fetchCardSpending(cardId, since),
  })
}

export function useSaveCardPayers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveCardPayers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  })
}
