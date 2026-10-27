# Features

One folder per domain (`accounts`, `transactions`, `categories`, …). Every
feature uses the same layout, and each file has one job:

```
features/<name>/
├── api/
│   ├── <name>.api.ts       # raw Supabase calls only
│   ├── <name>.keys.ts      # TanStack Query keys
│   └── <name>.queries.ts   # query/mutation hooks used by components
├── components/
│   └── <Component>/
│       ├── <Component>.tsx
│       └── use<Component>.ts   # component state/logic, if any
├── hooks/                  # UI-only hooks shared inside the feature
├── utils/                  # pure functions, no React
├── schemas.ts              # zod validation
├── types.ts
└── index.ts                # public exports — the only file other code imports
```

Rules:

- Import another feature only through its `index.ts`.
- Components never call Supabase directly; they use the feature's `api/` hooks.
- Generic, finance-agnostic UI goes in `src/components/ui`, not here.
