# Personal Finance App

Tracks credit card, checking and savings transactions, works out how much money
is left after the cards each account pays for, and exposes an API for iPhone
Shortcuts. See [PLAN.md](PLAN.md) for the full design.

## Stack

- **web/**: React + Vite + TypeScript, Tailwind, TanStack Query. Hosted on Vercel.
- **supabase/**: Postgres migrations, RLS, and Edge Functions. Hosted on Supabase.

## Local development

Requires Node 22 and Docker.

```sh
npm install                 # Supabase CLI
npm run db:start            # local Postgres, Auth, Studio; prints URL + keys

cd web
npm install
cp .env.example .env.local  # fill in VITE_SUPABASE_PUBLISHABLE_KEY from db:start
npm run dev
```

| Command (repo root) | What it does |
|---|---|
| `npm run db:new <name>` | Create a new migration file |
| `npm run db:reset` | Rebuild the local DB from migrations + seed |
| `npm run db:test` | Run pgTAP tests in `supabase/tests` |
| `npm run db:types` | Regenerate `web/src/types/database.ts` |

| Command (`web/`) | What it does |
|---|---|
| `npm run dev` | Start the app |
| `npm run lint` / `typecheck` / `test` / `format` | Checks (also run in CI) |

## Database changes

Never edit tables in the Supabase dashboard. Every change is a new file in
`supabase/migrations/`. Merging to `main` runs the **Deploy Supabase** workflow,
which applies pending migrations and deploys Edge Functions.

## Deployment setup (one time)

**Supabase → GitHub** (repo Settings → Secrets and variables → Actions):

| Name | Type | Value |
|---|---|---|
| `SUPABASE_PROJECT_ID` | Variable | Project ref, e.g. `abcd1234` from `abcd1234.supabase.co` |
| `SUPABASE_ACCESS_TOKEN` | Secret | supabase.com → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD` | Secret | Database password set when creating the project |

**Vercel**: import the repo, set **Root Directory** to `web`, and add
environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
(Supabase → Project Settings → API).
