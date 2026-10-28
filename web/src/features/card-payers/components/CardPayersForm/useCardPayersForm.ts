import { useState } from 'react'

import { useAccounts } from '@/features/accounts'
import { errorMessage } from '@/lib/errors'

import { useSaveCardPayers } from '../../api/cardPayers.queries'
import type { PayerSetup } from '../../types'
import { cleanRules, duplicateCategories } from '../../utils/payerSetup'

export type RuleDraft = { key: number; payerAccountId: string; categoryIds: string[] }

let nextKey = 0

export function useCardPayersForm({ setup, onDone }: { setup: PayerSetup; onDone: () => void }) {
  const { data: accounts = [] } = useAccounts()
  const payers = accounts.filter((a) => a.type !== 'credit_card')

  // Every card needs an "everything else" payer; start from the current one,
  // or the first checking account.
  const [defaultPayerId, setDefaultPayerId] = useState(
    setup.defaultPayerId ?? (payers.find((p) => p.type === 'checking') ?? payers[0])?.id ?? '',
  )
  const [rules, setRules] = useState<RuleDraft[]>(() =>
    setup.rules.map((r) => ({
      key: ++nextKey,
      payerAccountId: r.payerAccountId,
      categoryIds: r.categoryIds,
    })),
  )
  const [error, setError] = useState<string | null>(null)
  const save = useSaveCardPayers()

  function updateRule(key: number, change: Partial<RuleDraft>) {
    setRules((current) => current.map((r) => (r.key === key ? { ...r, ...change } : r)))
  }

  function setRuleCategories(key: number, categoryIds: string[]) {
    updateRule(key, { categoryIds })
  }

  function addRule() {
    const unused = payers.find(
      (p) => p.id !== defaultPayerId && !rules.some((r) => r.payerAccountId === p.id),
    )
    setRules((current) => [
      ...current,
      { key: ++nextKey, payerAccountId: unused?.id ?? payers[0]?.id ?? '', categoryIds: [] },
    ])
  }

  /** Which other rule already claims a category, if any. */
  function claimedBy(key: number, categoryId: string): string | null {
    const other = rules.find((r) => r.key !== key && r.categoryIds.includes(categoryId))
    return other
      ? (payers.find((p) => p.id === other.payerAccountId)?.name ?? 'another account')
      : null
  }

  async function onSubmit() {
    setError(null)
    if (!defaultPayerId) {
      setError('Choose the account that pays for everything else.')
      return
    }
    const cleaned = cleanRules(rules)
    if (duplicateCategories(cleaned).length > 0) {
      setError('Each category can only be paid by one account.')
      return
    }
    try {
      await save.mutateAsync({
        cardId: setup.cardId,
        defaultPayerId,
        rules: cleaned,
      })
      onDone()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return {
    payers,
    defaultPayerId,
    setDefaultPayerId,
    rules,
    updateRule,
    setRuleCategories,
    removeRule: (key: number) => setRules((current) => current.filter((r) => r.key !== key)),
    addRule,
    claimedBy,
    onSubmit,
    error,
    saving: save.isPending,
  }
}
