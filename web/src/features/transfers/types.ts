export type TransferInput = {
  fromAccountId: string
  toAccountId: string
  amountCents: number
  date: string
  note: string | null
}
