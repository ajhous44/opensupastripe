# CLAUDE.md

This repository is **OpenSupaStripe**, a reusable multitenant SaaS starter built with Next.js 16, React 19, Supabase, Stripe, and Vercel.

Claude and other coding agents should follow `AGENTS.md` as the primary agent guide. This file repeats the most important project-specific instructions for Claude-style workflows.

## What This Starter Provides

- Next.js App Router app in `apps/web`
- Supabase Auth with SSR cookies
- PostgreSQL migrations with RLS-backed tenant tables
- Organizations, team invites, roles, and profile flows
- Stripe subscription checkout, webhooks, and billing portal
- Marketing pages, auth pages, and an authenticated dashboard shell
- Placeholder tenant-site routing for subdomains/custom domains
- One example Supabase Edge Function in `supabase/functions/hello`

## Local Commands

```bash
npm install
npm run supabase:start
npm run supabase:db:push
npm run db:types
npm run dev
npm run type-check
npm run build
```

The web app intentionally runs with webpack:

```bash
npm --workspace apps/web run dev
npm --workspace apps/web run build
```

## Environment Setup

Copy:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Use `supabase status` for local Supabase URL and keys. Use `stripe listen --forward-to localhost:3000/api/stripe-webhook` for local webhook testing.

Never commit real `.env.local` values.

## MCP Recommendations

When available, configure these MCP servers for best results:

- Supabase MCP for schema, SQL, logs, advisors, and docs search.
- Stripe MCP for products, prices, subscriptions, customers, and webhooks.
- Vercel MCP for deployment, env var, domain, and log inspection.
- Browser automation MCP for full-flow verification.

Always inspect MCP tool schemas before calling tools. Authenticate only when a relevant tool reports that auth is required.

## Fetch Latest Docs First

Before changing Supabase, Stripe, Vercel, or Next.js integration code, verify against current docs.

Preferred order:

1. Use MCP docs search where available.
2. Fetch official docs pages directly.
3. Use web search only to find the right official page.

Useful doc roots:

- Supabase MCP: `https://supabase.com/docs/guides/getting-started/mcp`
- Supabase docs: `https://supabase.com/docs`
- Stripe docs: `https://docs.stripe.com`
- Vercel docs: `https://vercel.com/docs`
- Next.js docs: `https://nextjs.org/docs`

Supabase docs pages can often be read as markdown by appending `.md` to the docs URL path.

## Security Rules

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Keep Stripe secret/restricted keys and webhook secrets server-only.
- Do not put secrets in `NEXT_PUBLIC_*` env vars.
- Use RLS for tenant data.
- Do not use user-editable metadata for authorization decisions.
- Validate request bodies in route handlers and server actions.
- Verify Stripe webhook signatures.

## Code Style

- Prefer established local patterns over new abstractions.
- Keep generic starter copy generic.
- Do not add domain-specific modules to the starter.
- Keep public assets minimal and replaceable.
- Run `npm run type-check` and `npm run build` after substantive changes.

## Release Readiness Checklist

- `npm run type-check` passes.
- `npm run build` passes.
- No hardcoded private URLs, keys, DSNs, or tenant names.
- `apps/web/.env.example` documents every required env var.
- README, `AGENTS.md`, and this file match the current setup.
- Public assets are generic.
