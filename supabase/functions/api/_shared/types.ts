import type { Db } from './db.ts'

export type AppEnv = {
  Variables: {
    db: Db
    /** The token owner's user id, set by requireToken. */
    userId: string
  }
}
