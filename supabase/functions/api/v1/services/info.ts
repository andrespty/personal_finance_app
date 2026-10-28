import type { Db } from '../../_shared/db.ts'

type Info = {
  accounts: { id: string; name: string; alias: string | null; type: string }[]
  cards: { id: string; name: string; alias: string | null; wallet_name: string | null }[]
  /** Top-level category names. */
  categories: string[]
  /** Subcategory names, keyed by their category's name. */
  subcategories: Record<string, string[]>
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** Accounts, cards and categories for a Shortcut's pickers. */
export async function getInfo(db: Db, userId: string) {
  const info = await db.rpc<Info>('api_info', { user_ref: userId })
  return {
    message: `${plural(info.accounts.length, 'account')}, ${plural(info.cards.length, 'card')}, ${
      plural(info.categories.length, 'category').replace('categorys', 'categories')
    }.`,
    ...info,
  }
}
