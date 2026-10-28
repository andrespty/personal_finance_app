import { useQuery } from '@tanstack/react-query'

import { fetchMoneyLeft } from './moneyLeft.api'
import { moneyLeftKeys } from './moneyLeft.keys'

export function useMoneyLeft() {
  return useQuery({ queryKey: moneyLeftKeys.all, queryFn: fetchMoneyLeft })
}
