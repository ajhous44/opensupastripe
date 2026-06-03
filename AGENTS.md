# OpenSupaStripe Agent Guide

OpenSupaStripe is a reusable multitenant SaaS starter built with Next.js 16, React 19, Supabase, Stripe, and Vercel.

Use this file for AI coding agents working in this repository.

## Project Shape

```text
/
├── apps/web/          # Next.js App Router app
│   ├── src/app/       # Route groups, pages, route handlers
│   ├── src/components/
│   ├── src/lib/
│   ├── src/types/
│   └── public/
├── supabase/          # Supabase config, migrations, and example edge function
└── package.json       # npm workspaces root
```

## Core Commands

Run commands from the repo root unless noted.

```bash
npm install
npm run dev
npm run type-check
npm run lint
npm run build
npm run check
npm run supabase:start
npm run supabase:db:push
npm run db:types
```

The web app uses `next dev --webpack` and `next build --webpack` to avoid Turbopack workspace-root ambiguity in nested workspace clones.

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local`.

Required for auth/dashboard/billing:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `RESEND_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `VERCEL_API_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

Never expose `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret keys, webhook secrets, or Vercel tokens to browser code.

## MCP Servers

Recommended MCP servers for agents:

- **Supabase MCP** — schema inspection, SQL, logs, advisors, docs search.
- **Stripe MCP** — products, prices, checkout, subscriptions, webhooks.
- **Vercel MCP** — deployments, logs, env vars, domains.
- **Browser MCP / Playwright** — end-to-end verification.

Before calling MCP tools, inspect the tool schema/descriptor in your agent environment. Authenticate MCP servers only when a tool call reports auth is required.

Suggested setup references:

- Supabase MCP: `https://supabase.com/docs/guides/getting-started/mcp`
- Stripe docs: `https://docs.stripe.com/`
- Vercel docs: `https://vercel.com/docs`

## Current Docs Rule

Supabase, Stripe, Vercel, and Next.js change frequently. Before implementing or refactoring integration code:

1. Search current docs with MCP if available.
2. Otherwise fetch official docs pages directly.
3. Prefer official docs over model memory.

For Supabase docs, most docs pages can be fetched as markdown by appending `.md` to the URL path.

For Stripe, prefer the latest API version and Dashboard-configured dynamic payment methods. Do not hard-code `payment_method_types` unless building Stripe Terminal.

For Vercel, prefer the current platform guidance for Next.js App Router, environment variables, custom domains, and deployments.

## Supabase Guidelines

- Use `@supabase/ssr` with `getAll` / `setAll` cookie handling.
- Enable RLS on exposed-schema tables.
- Never use user-editable metadata for authorization.
- Keep `service_role` usage server-only and isolated to admin/server contexts.
- Use migrations for schema changes.
- Run `npm run db:types` after schema changes.
- Use local Supabase for development before touching production.

## Stripe Guidelines

- Use Checkout Sessions for subscription checkout.
- Verify webhooks using `STRIPE_WEBHOOK_SECRET`.
- Store Stripe customer/subscription IDs server-side.
- Keep all secret/restricted keys server-only.
- Use restricted API keys where possible.
- Keep product and price IDs in Stripe and mirror required IDs in `subscription_plans`.

## Next.js Guidelines

- Use App Router patterns.
- Prefer Server Components by default.
- Use Client Components only for browser state, effects, or event handlers.
- Avoid importing server-only code into Client Components.
- Keep route handlers and server actions side-effect safe and validated.
- Run `npm run type-check` and `npm run build` before handing off.

## Public Starter Expectations

- Keep copy generic and reusable.
- Do not reintroduce product-specific domain logic.
- Keep public assets minimal and replaceable.
- Avoid hardcoded production URLs, API keys, DSNs, or private organization names.
- Keep docs up to date when setup steps change.
