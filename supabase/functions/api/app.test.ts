import { assertEquals, assertMatch } from '@std/assert'

import { createApp } from './app.ts'
import { type Db, DbCallError } from './_shared/db.ts'

const TOKEN = 'pfa_' + 'a'.repeat(48)
const USER = '00000000-0000-0000-0000-00000000000a'

/** A fake database that records calls and answers from a table of handlers. */
function fakeDb(handlers: Record<string, (args: Record<string, unknown>) => unknown> = {}) {
  const calls: { fn: string; args: Record<string, unknown> }[] = []
  const db: Db = {
    rpc<T>(fn: string, args: Record<string, unknown>) {
      calls.push({ fn, args })
      if (fn === 'api_user_for_token') {
        return Promise.resolve((args.token === TOKEN ? USER : null) as T)
      }
      const handler = handlers[fn]
      if (!handler) return Promise.reject(new Error(`unexpected rpc ${fn}`))
      try {
        return Promise.resolve(handler(args) as T)
      } catch (error) {
        return Promise.reject(error)
      }
    },
  }
  return { db, calls }
}

function request(
  db: Db,
  path: string,
  init: RequestInit & { json?: unknown; token?: string | null } = {},
) {
  const headers = new Headers(init.headers)
  if (init.token !== null) headers.set('Authorization', `Bearer ${init.token ?? TOKEN}`)
  if (init.json !== undefined) headers.set('Content-Type', 'application/json')
  return createApp(db).request(`/api${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  })
}

const added = {
  id: 't1',
  account: 'Venture X',
  amount_cents: 5412,
  date: '2026-10-28',
  category_id: 'c1',
}

Deno.test('rejects requests without a valid token', async () => {
  const { db } = fakeDb()
  const missing = await request(db, '/v1/info', { token: null })
  assertEquals(missing.status, 401)
  assertMatch((await missing.json()).error, /Authorization: Bearer/)

  const wrong = await request(db, '/v1/info', { token: 'pfa_' + 'b'.repeat(48) })
  assertEquals(wrong.status, 401)
})

Deno.test('card charge: positive cents, merchant in the message', async () => {
  const { db, calls } = fakeDb({ api_add_transaction: () => added })
  const res = await request(db, '/v1/card-transactions', {
    method: 'POST',
    json: { card: 'vx', amount: '54.12', category: 'Shopping/Clothing', merchant: 'Uniqlo' },
  })
  assertEquals(res.status, 201)
  assertEquals((await res.json()).message, 'Logged $54.12 at Uniqlo on Venture X.')
  assertEquals(calls[1].args, {
    user_ref: USER,
    kind: 'card',
    account_ref: 'vx',
    amount_cents: 5412,
    category_ref: 'Shopping/Clothing',
    description: null,
    merchant: 'Uniqlo',
    on_date: null,
  })
})

Deno.test('card refund is negative; type is case-insensitive', async () => {
  const { db, calls } = fakeDb({ api_add_transaction: () => ({ ...added, amount_cents: -2000 }) })
  const res = await request(db, '/v1/card-transactions?format=text', {
    method: 'POST',
    json: {
      card: 'vx',
      type: 'Refund',
      amount: 20,
      category: 'Food',
      merchant: 'Uniqlo',
      date: '2026-10-27T09:30:00-05:00',
    },
  })
  assertEquals(await res.text(), 'Logged a $20.00 refund from Uniqlo on Venture X.')
  assertEquals(calls[1].args.amount_cents, -2000)
  assertEquals(calls[1].args.on_date, '2026-10-27')
})

Deno.test('card transactions require a category, a merchant and a positive amount', async () => {
  const { db } = fakeDb()
  const noCategory = await request(db, '/v1/card-transactions', {
    method: 'POST',
    json: { card: 'vx', amount: 5 },
  })
  assertEquals(noCategory.status, 400)
  assertEquals((await noCategory.json()).error, 'category is required.')

  const noMerchant = await request(db, '/v1/card-transactions', {
    method: 'POST',
    json: { card: 'vx', amount: 5, category: 'Food' },
  })
  assertEquals((await noMerchant.json()).error, 'merchant is required.')

  const negative = await request(db, '/v1/card-transactions', {
    method: 'POST',
    json: { card: 'vx', amount: '-5', category: 'Food', merchant: 'Shop' },
  })
  assertEquals(
    (await negative.json()).error,
    'amount must be a positive dollar amount, like 12.50.',
  )
})

Deno.test('deposits are positive and withdrawals negative', async () => {
  const { db, calls } = fakeDb({
    api_add_transaction: (args) => ({
      ...added,
      account: 'General Checking',
      amount_cents: args.amount_cents,
    }),
  })
  const dep = await request(db, '/v1/deposits', {
    method: 'POST',
    json: { account: 'general', amount: '$1,200' },
  })
  assertEquals((await dep.json()).message, 'Deposited $1,200.00 into General Checking.')
  const wd = await request(db, '/v1/withdrawals', {
    method: 'POST',
    json: { account: 'general', amount: 40 },
  })
  assertEquals((await wd.json()).message, 'Withdrew $40.00 from General Checking.')
  assertEquals([calls[1].args.amount_cents, calls[3].args.amount_cents], [120000, -4000])
  assertEquals([calls[1].args.kind, calls[3].args.kind], ['bank', 'bank'])
})

Deno.test('transfers move money and report both accounts', async () => {
  const { db, calls } = fakeDb({
    api_transfer: () => ({
      id: 'x',
      from: 'General Checking',
      to: 'Savings',
      amount_cents: 5000,
      date: '2026-10-28',
    }),
  })
  const res = await request(db, '/v1/transfers', {
    method: 'POST',
    json: { from: 'general', to: 'savings', amount: 50 },
  })
  assertEquals((await res.json()).message, 'Moved $50.00 from General Checking to Savings.')
  assertEquals(calls[1].args.amount_cents, 5000)
})

Deno.test('database rule errors become readable 400s; not-found becomes 404', async () => {
  const { db } = fakeDb({
    api_transfer: () => {
      throw new DbCallError(
        '23514',
        'Transfers are only between checking and savings. Pay cards in the app.',
      )
    },
    api_add_transaction: () => {
      throw new DbCallError('P0002', 'No account named "nope".')
    },
  })
  const transfer = await request(db, '/v1/transfers?format=text', {
    method: 'POST',
    json: { from: 'general', to: 'vx', amount: 50 },
  })
  assertEquals(transfer.status, 400)
  assertEquals(
    await transfer.text(),
    'Transfers are only between checking and savings. Pay cards in the app.',
  )

  const missing = await request(db, '/v1/deposits', {
    method: 'POST',
    json: { account: 'nope', amount: 1 },
  })
  assertEquals(missing.status, 404)
})

Deno.test('unexpected errors hide their details', async () => {
  const { db } = fakeDb({
    api_info: () => {
      throw new Error('connection reset')
    },
  })
  const original = console.error
  console.error = () => {}
  const res = await request(db, '/v1/info')
  console.error = original
  assertEquals(res.status, 500)
  assertEquals((await res.json()).error, 'Something went wrong. Try again in a moment.')
})

Deno.test('info returns pickers and a summary', async () => {
  const { db } = fakeDb({
    api_info: () => ({
      accounts: [{ id: 'a', name: 'General Checking', alias: 'general', type: 'checking' }],
      cards: [{ id: 'c', name: 'Venture X', alias: 'vx', wallet_name: 'Venture X Card' }],
      categories: ['Food', 'Other'],
      subcategories: { Food: ['Coffee', 'Groceries'], Other: [] },
    }),
  })
  const body = await (await request(db, '/v1/info')).json()
  assertEquals(body.message, '1 account, 1 card, 2 categories.')
  assertEquals(body.subcategories.Food, ['Coffee', 'Groceries'])
  assertEquals(body.cards[0].wallet_name, 'Venture X Card')
})

Deno.test('money left: all accounts, one account, or text for Siri', async () => {
  const rows = [
    {
      id: 'a1',
      name: 'General Checking',
      alias: 'general',
      balance_cents: 300000,
      covers_cents: 30000,
      money_left_cents: 270000,
    },
    {
      id: 'a2',
      name: 'Fun Checking',
      alias: 'fun',
      balance_cents: 44000,
      covers_cents: 9000,
      money_left_cents: 35000,
    },
  ]
  const { db } = fakeDb({ api_money_left: () => rows })

  const all = await (await request(db, '/v1/money-left')).json()
  assertEquals(all.total_money_left_cents, 305000)
  assertEquals(all.message, '$3,050.00 left. General Checking: $2,700.00. Fun Checking: $350.00.')

  const one = await request(db, '/v1/money-left?account=FUN&format=text')
  assertEquals(await one.text(), 'Fun Checking has $350.00 left.')

  const unknown = await request(db, '/v1/money-left?account=vacation')
  assertEquals(unknown.status, 404)
})

Deno.test('bad JSON and unknown paths get clear errors', async () => {
  const { db } = fakeDb()
  const badJson = await request(db, '/v1/deposits', { method: 'POST', body: 'amount=5' })
  assertEquals((await badJson.json()).error, 'Send the request body as JSON.')
  const nowhere = await request(db, '/v1/nope')
  assertEquals(nowhere.status, 404)
})
