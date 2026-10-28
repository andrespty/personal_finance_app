import type { Account } from '@/features/accounts'
import { categoryLabel, type Category } from '@/features/categories'

import type { CardSpending, PayerSetup, PayerShare } from '../types'

export type PayerRow = { key: string; name: string; detail: string; shareCents: number }

const nameOf = (accounts: Account[], id: string) =>
  accounts.find((a) => a.id === id)?.name ?? 'Unknown account'

/**
 * One row per payer on a card: configured payers first (default, then
 * category rules), then anyone else with a balance (e.g. a payment from an
 * account that isn't set up as a payer), then the uncovered part.
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

  if (setup.defaultPayerId) {
    listed.add(setup.defaultPayerId)
    rows.push({
      key: setup.defaultPayerId,
      name: nameOf(accounts, setup.defaultPayerId),
      detail: setup.rules.length > 0 ? 'Everything else' : 'Everything',
      shareCents: shareOf(setup.defaultPayerId),
    })
  }
  for (const rule of setup.rules) {
    const names = rule.categoryIds
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is Category => Boolean(c))
      .map((c) => c.name)
    const existing = rows.find((r) => r.key === rule.payerAccountId)
    if (existing) {
      existing.detail = `${existing.detail}, plus ${names.join(', ')}`
      continue
    }
    listed.add(rule.payerAccountId)
    rows.push({
      key: rule.payerAccountId,
      name: nameOf(accounts, rule.payerAccountId),
      detail: names.join(', '),
      shareCents: shareOf(rule.payerAccountId),
    })
  }
  for (const share of shares) {
    if (
      share.cardId !== setup.cardId ||
      share.payerAccountId === null ||
      listed.has(share.payerAccountId)
    )
      continue
    if (share.shareCents === 0) continue
    rows.push({
      key: share.payerAccountId,
      name: nameOf(accounts, share.payerAccountId),
      detail: 'Not a payer for this card',
      shareCents: share.shareCents,
    })
  }
  const uncovered = shareOf(null)
  if (uncovered !== 0) {
    rows.push({
      key: 'uncovered',
      name: 'No one',
      detail: 'Not covered by any account',
      shareCents: uncovered,
    })
  }
  return rows
}

/** The card's balance split by payer, for the bar on the card. */
export function cardSplit(cardId: string, shares: PayerShare[], accounts: Account[]) {
  return shares
    .filter((s) => s.cardId === cardId && s.shareCents > 0)
    .sort((a, b) => b.shareCents - a.shareCents)
    .map((s) => ({
      label: s.payerAccountId ? nameOf(accounts, s.payerAccountId).split(' ')[0] : 'Uncovered',
      cents: s.shareCents,
    }))
}

export type CategorySpend = {
  categoryId: string | null
  label: string
  payerName: string
  cents: number
}

/** Spending grouped by category, largest first. */
export function spendingByCategory(
  spending: CardSpending[],
  accounts: Account[],
  categories: Category[],
): CategorySpend[] {
  const groups = new Map<string, CategorySpend>()
  for (const row of spending) {
    const key = row.categoryId ?? 'none'
    const category = categories.find((c) => c.id === row.categoryId)
    const group = groups.get(key) ?? {
      categoryId: row.categoryId,
      label: category ? categoryLabel(category, categories) : 'Uncategorized',
      payerName: row.payerAccountId ? nameOf(accounts, row.payerAccountId) : 'No one',
      cents: 0,
    }
    group.cents += row.amountCents
    groups.set(key, group)
  }
  return [...groups.values()].filter((g) => g.cents !== 0).sort((a, b) => b.cents - a.cents)
}

/** First day of the month containing `date`, as YYYY-MM-DD. */
export function monthStart(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}
