import { Hono } from 'hono'

import { requireToken } from '../_shared/auth.ts'
import type { AppEnv } from '../_shared/types.ts'
import { deposits, withdrawals } from './routes/bankEntries.ts'
import { cardTransactions } from './routes/cardTransactions.ts'
import { info } from './routes/info.ts'
import { moneyLeft } from './routes/moneyLeft.ts'
import { transfers } from './routes/transfers.ts'

/** Version 1 of the Shortcuts API. Every route needs an API token. */
export const v1 = new Hono<AppEnv>()
  .use('*', requireToken)
  .route('/card-transactions', cardTransactions)
  .route('/transfers', transfers)
  .route('/deposits', deposits)
  .route('/withdrawals', withdrawals)
  .route('/info', info)
  .route('/money-left', moneyLeft)
