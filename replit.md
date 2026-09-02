# Mim's Cake by World

An editorial, mobile-ready website for a homemade cake and dessert business in Rangpur, Bangladesh, with direct WhatsApp ordering.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mims-cake-by-world/src/App.tsx` — single-page site structure, ordering modal, navigation, and contact actions
- `artifacts/mims-cake-by-world/src/index.css` — brand tokens, typography, responsive layout, and motion
- `artifacts/mims-cake-by-world/index.html` — static SEO and social metadata

## Architecture decisions

- The bakery site is a frontend-only React/Vite artifact; it does not require a backend or database.
- Orders open WhatsApp with the visitor's submitted details so the existing business workflow stays simple.
- Remote Pexels photography keeps the static site lightweight while preserving a premium visual presentation.

## Product

Visitors can explore the bakery's story and cake collection, browse reviews, find the Rangpur location, open social/contact links, and start a personalized WhatsApp order from the site.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
