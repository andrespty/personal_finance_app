/** A card's payer setup: one optional default, plus payers for specific categories. */
export type PayerSetup = {
  cardId: string
  defaultPayerId: string | null
  rules: PayerRule[]
}

export type PayerRule = { payerAccountId: string; categoryIds: string[] }

/** What one payer owes on one card. payerAccountId null = no payer covers it. */
export type PayerShare = { cardId: string; payerAccountId: string | null; shareCents: number }

/** A regular card transaction with its resolved payer. */
export type CardSpending = {
  cardId: string
  categoryId: string | null
  payerAccountId: string | null
  amountCents: number
}
