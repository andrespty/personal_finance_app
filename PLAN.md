# Personal Finance App — Plan

A simple tracker for credit card, checking, and savings transactions, with an
API for iPhone Shortcuts. Each user has their own personal accounts and setup.

---

## 1. Architecture

| Piece | Choice | Cost |
|---|---|---|
| Frontend | React + Vite + TypeScript, installable PWA | Free (Cloudflare Pages / Vercel / Netlify) |
| Database | Supabase Postgres with Row Level Security (RLS) | Free tier |
| Auth | Supabase Auth — email + password | Free |
| Shortcuts API | One Supabase Edge Function (`api`, Hono router) | Free tier |

- The web app talks to Supabase directly (supabase-js + RLS).
- iPhone Shortcuts call the Edge Function with a **personal API token**
  (`Authorization: Bearer <token>`). Tokens are generated in Settings, shown
  once, and stored hashed.
- All money math lives in SQL views so the app and the API always agree.
- Note: Supabase free projects pause after ~7 days of inactivity.

---

## 2. Data Model

Every row is owned by a single user (`user_id`). No shared/household data.
Money is stored as **integer cents** (`bigint`).

```
profiles
  user_id, display_name, onboarding_step

accounts
  id, user_id, name, alias, wallet_name
  type: checking | savings | credit_card
  opening_balance_cents   -- checking/savings only; cards always start at 0
  credit_limit_cents      -- cards only
  archived

categories
  id, user_id, name, icon, color
  parent_id -> categories.id   -- null = top level; max 2 levels

transactions
  id, user_id, account_id, amount_cents, date
  description, merchant, category_id
  kind: regular | transfer | payment
  transfer_id -> transfers.id  -- null for regular
  source: app | shortcut

transfers
  id, user_id, kind: transfer | payment
  from_account_id, to_account_id, amount_cents, date, note

card_payers
  id, user_id, card_id, payer_account_id, is_default   -- exactly one default per card

card_payer_categories
  card_id, card_payer_id, category_id                  -- unique (card_id, category_id)

api_tokens
  id, user_id, name, token_hash, last_used_at, revoked_at
```

### Sign rules

| Account | Positive | Negative |
|---|---|---|
| Credit card | charge | payment or refund |
| Checking / savings | deposit | withdrawal |

- **Transfer** (checking/savings ↔ checking/savings only): −X on `from`, +X on `to`.
- **Payment** (checking/savings → credit card): −X on **both** sides.
- Transfers and payments are created only through a DB function that validates
  account types and writes both rows atomically.

### Category rules

| Transaction | Category |
|---|---|
| Card charge / refund | Required |
| Deposit / withdrawal | Optional |
| Transfer / payment | None |

### Card payers & money left

A card has one **default payer** and optional payers that cover specific
categories. Example — Venture X:
- Fun Checking pays for Clothing and Gaming
- General Checking (default) pays for everything else

Payer resolution for a transaction: subcategory rule → parent category rule →
card default. Rules are resolved at query time, so changes apply to past
transactions too.

```
payer share on card = charges/refunds in its categories − payments from that payer to the card
money left          = account balance − its share on every card it pays for
```

A payment only reduces the share of the account it came from.

---

## 3. API (Shortcuts) — v1

Base: `https://<project>.supabase.co/functions/v1/api/v1/...`
Auth: `Authorization: Bearer <token>`

| # | Method | Route | Body / Params |
|---|---|---|---|
| 1 | `POST` | `/v1/card-transactions` | `card`, `type: charge \| refund`, `amount`, `category`, `description?`, `merchant?`, `date?` |
| 2 | `POST` | `/v1/transfers` | `from`, `to`, `amount`, `date?`, `note?` |
| 3 | `POST` | `/v1/deposits` | `account`, `amount`, `category?`, `description?`, `date?` |
| 4 | `POST` | `/v1/withdrawals` | same as deposits (stored as negative) |
| 5 | `GET` | `/v1/info` | — |
| 6 | `GET` | `/v1/money-left` | `account?`, `format=text?` |

Conventions:
- `amount` is in dollars and must be positive; the server applies the sign.
- `card` / `account` accept an id, alias, or `wallet_name` (for Apple Pay
  Wallet automations).
- Categories accept a name or path (`Gaming`, `Entertainment/Gaming`).
- `date` defaults to today.
- `?format=text` returns a Siri-readable sentence.
- Errors return a short, human-readable message.
- Card payments are made from the web app only.

`/v1/info` response:

```json
{
  "accounts":   [{ "id": "...", "name": "Fun Checking", "alias": "fun", "type": "checking" }],
  "cards":      [{ "id": "...", "name": "Venture X", "alias": "vx", "wallet_name": "Venture X Card" }],
  "categories": [{ "id": "...", "name": "Gaming", "path": "Entertainment/Gaming" }]
}
```

---

## 4. Folder Structure

```
personal_finance_app/
├── web/
├── supabase/
├── shortcuts/        # docs + screenshots for each Shortcut
├── PLAN.md
└── README.md
```

### `web/`

```
web/src/
├── app/
│   ├── providers.tsx
│   ├── router.tsx
│   └── layouts/
├── pages/                  # thin route screens that compose features
├── features/
│   ├── accounts/
│   ├── transactions/
│   ├── transfers/
│   ├── categories/
│   ├── card-payers/
│   ├── money-left/
│   ├── onboarding/
│   ├── api-tokens/
│   └── auth/
├── components/ui/          # generic, finance-agnostic primitives
├── lib/                    # supabase client, money, dates
└── types/database.ts       # generated by `supabase gen types`
```

Every feature follows the same layout:

```
features/transactions/
├── api/
│   ├── transactions.api.ts      # raw Supabase calls only
│   ├── transactions.keys.ts     # query keys
│   └── transactions.queries.ts  # TanStack Query hooks
├── components/
│   ├── TransactionList/
│   │   ├── TransactionList.tsx
│   │   └── TransactionRow.tsx
│   └── TransactionForm/
│       ├── TransactionForm.tsx
│       └── useTransactionForm.ts
├── hooks/                       # UI-only logic
├── utils/                       # pure functions, no React
├── schemas.ts                   # zod validation
├── types.ts
└── index.ts                     # public exports only
```

Rules:
- `components/ui` has no business logic — props in, UI out.
- Features import only from `ui`, `lib`, and other features' `index.ts`.
- Pages contain no logic.
- Components never call Supabase directly; they use the feature's `api/` hooks.

### `supabase/`

```
supabase/
├── config.toml
├── migrations/             # one file per concern
├── functions/
│   └── api/
│       ├── index.ts        # mounts /v1 (later /v2)
│       ├── _shared/        # token auth, errors, db client
│       └── v1/
│           ├── routes/     # HTTP only
│           ├── services/   # business logic
│           └── schemas/    # zod request validation
├── tests/                  # pgTAP: RLS, transfers, money-left math
└── seed.sql
```

---

## 5. Screens

Mobile-first. Bottom tabs: **Dashboard · Accounts · Transactions · Settings**,
plus a floating **+** quick-add button.

| Page | Contents |
|---|---|
| Login / Sign up | Email + password |
| Onboarding | Guided setup (see below) |
| Dashboard | Money left per checking/savings, owed per card, last 5 transactions |
| Accounts | Grouped list with balances; add account |
| Account detail | Balance, money left, card shares it covers, transactions; Deposit / Withdraw / Transfer |
| Card detail | Total owed, breakdown by payer → category, transactions; Charge / Refund / Pay |
| Card payers | Default payer + category rules (in card settings) |
| Transactions | All transactions with filters; edit / delete |
| Categories | Tree editor |
| Settings | Profile, API tokens, sign out |

Shared modal forms: Transaction, Transfer, Payment, Account.

---

## 6. Guided Setup (first login)

1. **Welcome** — display name.
2. **Accounts** — add at least one checking/savings account with opening balance.
3. **Cards** — add credit cards (skippable).
4. **Categories** — pick from the starter list (see below).
5. **Card payers** — per card, choose default payer and optional category rules.
6. **Done** → Dashboard.

Progress is saved in `profiles.onboarding_step`, so setup resumes where the user
left off. Everything remains editable later.

### Categories step

The user sees the starter categories as a checklist, grouped by parent:
- All are pre-selected; tap to deselect.
- Selecting/deselecting a parent toggles its subcategories.
- Rename any item inline, or add a custom category/subcategory.
- **Continue** creates only the selected categories for that user.

Starter list (a template, not copied automatically):

| Parent | Subcategories |
|---|---|
| Food | Groceries, Restaurants, Coffee |
| Shopping | Clothing, Electronics, Home |
| Transport | Gas, Rideshare, Parking |
| Bills | Rent, Utilities, Phone, Internet, Subscriptions |
| Entertainment | Gaming, Movies, Events |
| Health | Pharmacy, Doctor, Fitness |
| Travel | Flights, Hotels |
| Income | Salary, Other Income |
| Other | — |

---

## 7. Visual Style

Direction: **bold & minimal + wallet cards**. Clean, flat, no boxes; big
numbers; credit cards drawn as real cards. Must not feel AI-generated: no
gradients, glows, emoji icons, or chatty copy.

- **Layout:** flat white/black background, lists separated by hairlines, no
  card containers. Big balance on top.
- **Credit cards:** rendered as physical cards (1.586 ratio) with owed amount
  and payer split bar. Swipeable row on Dashboard, full width on Card detail.
- **Type:** Geist (system font fallback), tabular numbers. Hero balance 48px,
  amount entry 56px.
- **Forms:** bottom sheets; amount first, with number pad.
- **Motion:** 150–200 ms fades/slides only.
- **Dark mode:** follows the system.

| Token | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#0A0D0B` |
| Text | `#0B110E` | `#F1F5F3` |
| Secondary | `#6C7771` | `#8A968F` |
| Border | `#EAEDEB` | `#1E2622` |
| Fill (inputs, tracks) | `#F3F5F4` | `#141A17` |
| Accent (green) | `#146B47` | `#5FD59A` |
| Money in | `#167A4F` | `#5FD59A` |
| Owed / out | `#B5432E` | `#FF8A72` |
| Card (green) | `#123C2C` | `#1C4A37` |
| Card (graphite) | `#2B2F2D` | `#2A302D` |

---

## 8. Build Order

1. **Setup** — Supabase project + CLI, Vite app, deploy pipeline.
2. **Core** — schema, RLS, auth, accounts, categories, transactions, balances.
3. **Onboarding** — guided setup.
4. **Card payers & money left** — views + dashboard.
5. **API** — token management, `api` Edge Function, first Shortcuts.
6. **Features** — to be discussed.
