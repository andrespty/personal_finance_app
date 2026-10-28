import type { Account } from '@/features/accounts'
import type { Category } from '@/features/categories'

import type { CardSpending, PayerSetup, PayerShare } from '../types'

export type PayerRow = {
  key: string
  name: string
  detail: string
  shareCents: number
  /** CSS color for this payer's dot and bar slice. */
  color: string
}

const nameOf = (accounts: Account[], id: string) =>
  accounts.find((a) => a.id === id)?.name ?? 'Unknown account'

const RULE_COLORS = ['var(--payer-2)', 'var(--payer-3)', 'var(--payer-4)']

/**
 * A payer's color, the same on every tab: the "everything else" payer is the
 * first color, category payers take the next ones in order, anyone else is
 * muted.
 */
export function payerColor(setup: PayerSetup, accountId: string | null): string {
  if (accountId === null) return 'var(--negative)'
  const ruleIndex = setup.rules.findIndex((r) => r.payerAccountId === accountId)
  if (ruleIndex >= 0 && accountId !== setup.defaultPayerId) {
    return RULE_COLORS[ruleIndex % RULE_COLORS.length]
  }
  if (accountId === setup.defaultPayerId) return 'var(--payer-1)'
  return 'var(--muted)'
}

/**
 * One row per payer on a card: category payers first, then anyone else with
 * a balance (e.g. a payment from an account that isn't a payer), then the
 * "everything else" payer last. An uncovered part can only exist for cards
 * set up before every card had a default payer.
 */
export function payerRows(
  setup: PayerSetup,
  shares: PayerShare[],
  accounts: Account[],
  categories: Category[],
): PayerRow[] {
  const shareOf = (payerId: string | null) =>
    shares.find((s) => s.cardId === setup.cardId && s.payerAccountId === payerId)?.shareCents ?? 0
  const rows: PayerRow[] = []
  const listed = new Set<string>()
  const row = (id: string, detail: string): PayerRow => ({
    key: id,
    name: nameOf(accounts, id),
    detail,
    shareCents: shareOf(id),
    color: payerColor(setup, id),
  })

  for (const rule of setup.rules) {
    if (rule.payerAccountId === setup.defaultPayerId) continue
    const names = rule.categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    listed.add(rule.payerAccountId)
    rows.push(row(rule.payerAccountId, names.join(', ')))
  }

  for (const share of shares) {
    const id = share.payerAccountId
    if (share.cardId !== setup.cardId || id === null || id === setup.defaultPayerId) continue
    if (listed.has(id) || share.shareCents === 0) continue
    rows.push(row(id, 'Not a payer for this card'))
  }

  if (setup.defaultPayerId) {
    rows.push(row(setup.defaultPayerId, setup.rules.length > 0 ? 'Everything else' : 'Everything'))
  }

  const uncovered = shareOf(null)
  if (uncovered !== 0) {
    rows.push({
      key: 'uncovered',
      name: 'No one',
      detail: 'Not covered by any account',
      shareCents: uncovered,
      color: 'var(--negative)',
    })
  }
  return rows
}

/** Percent of `total` (positive amounts only), rounded; null when it doesn't apply. */
export function percentOf(cents: number, total: number): number | null {
  if (cents <= 0 || total <= 0) return null
  return Math.round((cents / total) * 100)
}

export type SpendingLine = {
  key: string
  name: string
  cents: number
  payerAccountId: string | null
}

export type SpendingGroup = {
  key: string
  name: string
  cents: number
  lines: SpendingLine[]
}

/**
 * Spending grouped by top-level category, largest first, with its
 * subcategories underneath. Spending on the parent itself becomes a
 * "No subcategory" line.
 */
export function groupSpending(spending: CardSpending[], categories: Category[]): SpendingGroup[] {
  const groups = new Map<string, SpendingGroup>()
  for (const row of spending) {
    const category = categories.find((c) => c.id === row.categoryId)
    const parent = category?.parent_id
      ? categories.find((c) => c.id === category.parent_id)
      : category
    const groupKey = parent?.id ?? 'none'
    const group = groups.get(groupKey) ?? {
      key: groupKey,
      name: parent?.name ?? 'Uncategorized',
      cents: 0,
      lines: [],
    }
    const lineKey = category?.parent_id ? category.id : `${groupKey}:self`
    let line = group.lines.find((l) => l.key === lineKey)
    if (!line) {
      line = {
        key: lineKey,
        name: category?.parent_id ? category.name : 'No subcategory',
        cents: 0,
        payerAccountId: row.payerAccountId,
      }
      group.lines.push(line)
    }
    line.cents += row.amountCents
    group.cents += row.amountCents
    groups.set(groupKey, group)
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      lines: g.lines.filter((l) => l.cents !== 0).sort((a, b) => b.cents - a.cents),
    }))
    .filter((g) => g.cents !== 0)
    .sort((a, b) => b.cents - a.cents)
}

/** First day of the month containing `date`, as YYYY-MM-DD. */
export function monthStart(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}
