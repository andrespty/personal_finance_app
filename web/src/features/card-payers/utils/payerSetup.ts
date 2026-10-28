import type { PayerRule, PayerSetup } from '../types'

type PayerRow = { id: string; card_id: string; payer_account_id: string; is_default: boolean }
type RuleRow = { card_payer_id: string; category_id: string }

/** Groups card_payers and card_payer_categories rows into one setup per card. */
export function toSetups(payers: PayerRow[], rules: RuleRow[]): PayerSetup[] {
  const byCard = new Map<string, PayerSetup>()
  for (const payer of payers) {
    const setup = byCard.get(payer.card_id) ?? {
      cardId: payer.card_id,
      defaultPayerId: null,
      rules: [],
    }
    if (payer.is_default) setup.defaultPayerId = payer.payer_account_id
    const categoryIds = rules.filter((r) => r.card_payer_id === payer.id).map((r) => r.category_id)
    if (categoryIds.length > 0)
      setup.rules.push({ payerAccountId: payer.payer_account_id, categoryIds })
    byCard.set(payer.card_id, setup)
  }
  return [...byCard.values()]
}

/** Drops empty rules and merges rules for the same payer before saving. */
export function cleanRules(rules: PayerRule[]): PayerRule[] {
  const merged = new Map<string, Set<string>>()
  for (const rule of rules) {
    if (!rule.payerAccountId || rule.categoryIds.length === 0) continue
    const ids = merged.get(rule.payerAccountId) ?? new Set<string>()
    rule.categoryIds.forEach((id) => ids.add(id))
    merged.set(rule.payerAccountId, ids)
  }
  return [...merged].map(([payerAccountId, ids]) => ({ payerAccountId, categoryIds: [...ids] }))
}

/** Category ids claimed by more than one rule. */
export function duplicateCategories(rules: PayerRule[]): string[] {
  const seen = new Map<string, string>()
  const dupes = new Set<string>()
  for (const rule of rules) {
    for (const id of rule.categoryIds) {
      const owner = seen.get(id)
      if (owner && owner !== rule.payerAccountId) dupes.add(id)
      seen.set(id, rule.payerAccountId)
    }
  }
  return [...dupes]
}

export function isConfigured(setup: PayerSetup): boolean {
  return setup.defaultPayerId !== null || setup.rules.length > 0
}
