/** Money left in a checking/savings account after what it owes on cards. */
export type MoneyLeft = {
  accountId: string
  balanceCents: number
  coversCents: number
  moneyLeftCents: number
}
