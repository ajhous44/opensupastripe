# OpenSupaStripe

Production-ready **multitenant SaaS starter** built with Next.js, Supabase, Stripe, and Vercel.

<p align="center">
  <a href="https://nextjs.org" title="Next.js"><img src="docs/assets/logos/nextjs.svg" alt="Next.js" height="40" /></a>
  &nbsp;&nbsp;
  <a href="https://supabase.com" title="Supabase"><img src="docs/assets/logos/supabase.svg" alt="Supabase" height="40" /></a>
  &nbsp;&nbsp;
  <a href="https://stripe.com" title="Stripe"><img src="docs/assets/logos/stripe.svg" alt="Stripe" height="40" /></a>
  &nbsp;&nbsp;
  <a href="https://vercel.com" title="Vercel"><img src="docs/assets/logos/vercel.svg" alt="Vercel" height="40" /></a>
</p>

## Overview

<p align="center">
  <a href="docs/assets/opensupastripe-features.mp4" title="Watch the feature overview">
    <img src="docs/assets/opensupastripe-features-poster.png" alt="OpenSupaStripe feature overview" width="720" />
  </a>
</p>

<p align="center"><em><a href="docs/assets/opensupastripe-features.mp4">▶ Watch the 24s feature overview</a></em></p>

<p align="center"><sub>Music: "Inspired" by <a href="https://incompetech.com/">Kevin MacLeod</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. See <a href="docs/assets/CREDITS.md">media credits</a>.</sub></p>

OpenSupaStripe is a generic foundation for SaaS products that need authentication, organizations, team invites, subscriptions, dashboard routes, subdomain routing, and marketing pages without product-specific business logic.

## What's Included

| Layer | Features |
| --- | --- |
| **Next.js 16** | App Router, Server Components, route handlers, middleware/proxy tenant routing |
| **Supabase** | Auth with SSR cookies, PostgreSQL, Row Level Security, tenant isolation |
| **Stripe** | Checkout, webhooks, billing portal, subscription lifecycle |
| **Vercel** | Deployment-ready configuration and custom-domain route handlers |
| **Marketing** | Homepage, pricing, features, integrations, about, contact, privacy, terms |
| **Dashboard** | Auth-protected shell with organization creation, team, billing, settings, profile |

## What's Not Included

Product-specific modules are intentionally excluded. Add your own domain features on top of the tenant, auth, billing, and dashboard foundation.

## Quick Start

### 1. Install

```bash
cd opensupastripe
npm install
```

### 2. Configure Env

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in Supabase and Stripe values. Marketing pages can run without Supabase env vars, but auth, dashboard, tenant routing, and billing require them.

### 3. Start Supabase Locally

```bash
npm run supabase:start
npm run supabase:db:push
npm run db:types
```

Use `supabase status` to get local URL and keys for `apps/web/.env.local`.

### 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`. Test tenant subdomains at `http://your-org.localhost:3000`.

## Stripe Setup

1. Create products and prices in Stripe Dashboard test mode.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and optional `NEXT_PUBLIC_STRIPE_PRICE_ID` to `apps/web/.env.local`.
3. Add product/price IDs to `subscription_plans` in Supabase.
4. Configure a local webhook while developing:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Recommended webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Sentry Setup (Optional)

OpenSupaStripe does **not** ship with Sentry pre-installed. Error monitoring is optional so the starter runs without a third-party account. When you are ready, add it with [Sentry’s free Developer plan](https://sentry.io/pricing/) (sufficient for solo dev and early production).

### 1. Create a Sentry project

1. Sign up at [sentry.io](https://sentry.io/) (free Developer plan).
2. Create an organization and a **Next.js** project.
3. Copy the **DSN** from **Project Settings → Client Keys (DSN)**.

### 2. Install the SDK in `apps/web`

From the repo root:

```bash
cd apps/web
npx @sentry/wizard@latest -i nextjs
```

The wizard installs `@sentry/nextjs`, adds client/server/edge init files, wraps `next.config`, and can create a test page at `/sentry-example-page`. For a minimal starter, enable **Error Monitoring** first; add Tracing, Session Replay, or Logs later if you need them (they affect quota on the free tier).

### 3. Configure environment variables

Add to `apps/web/.env.local` (values come from the wizard or your Sentry project):

```bash
# Required to send events
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Optional: source map uploads and release tracking (CI / Vercel build)
SENTRY_AUTH_TOKEN=
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

Never commit real DSNs or `SENTRY_AUTH_TOKEN`. The wizard may create `.env.sentry-build-plugin` for local builds; keep that file out of git.

For **Vercel**, add the same variables in the project’s environment settings (Production and Preview). Use `SENTRY_AUTH_TOKEN` only in the build environment if you upload source maps.

### 4. Verify

```bash
npm run dev
```

Open `http://localhost:3000/sentry-example-page` (if the wizard created it) and trigger the sample error. Confirm the issue appears in the Sentry dashboard.

### 5. Recommended follow-ups (free tier)

- Connect your GitHub repo in Sentry for suspect commits and release context.
- Add an alert (e.g. Slack or email) for new issues in production.
- Tune `tracesSampleRate` and replay sampling in production to stay within free-tier limits.

Official docs: [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

## Architecture

```text
opensupastripe/
├── apps/web/          # Next.js application
│   ├── src/app/
│   │   ├── (auth)/           # Login, signup, password reset
│   │   ├── (dashboard)/      # Protected dashboard
│   │   ├── (marketing)/      # Public marketing pages
│   │   ├── (tenant-sites)/   # Placeholder tenant-facing site
│   │   └── api/              # Stripe checkout, webhooks, domains
│   ├── src/proxy.ts          # Auth, tenant routing, CSP
│   └── src/lib/              # Supabase clients, Stripe, config
└── supabase/
    ├── migrations/           # Core multitenant schema
    ├── functions/hello/      # Example Edge Function
    └── config.toml
```

### Multitenant Model

- `organizations` — tenant table with `subdomain`, `custom_domain`, owner
- `team_members` — multi-user access with roles (`owner`, `admin`, `staff`)
- `organization_invites` — email invite tokens
- `subscriptions` — Stripe billing linked to organizations
- RLS policies protect tenant data in Supabase

Subdomain requests are rewritten to `(tenant-sites)/tenant-site/*`. Replace this placeholder with your customer-facing product.

## Database Schema

Core migrations live in `supabase/migrations/`.

Main tables:

- `profiles`
- `organizations`
- `team_members`
- `organization_invites`
- `subscription_plans`
- `subscriptions`
- `subscription_events`

Views:

- `organizations_public`
- `organization_subscriptions`

## Deployment

1. Connect the repo to Vercel.
2. Set the project root to `apps/web` if deploying as a monorepo app.
3. Add environment variables from `apps/web/.env.example`.
4. Link a production Supabase project and apply migrations.
5. Configure Stripe webhook endpoint: `https://your-domain.com/api/stripe-webhook`.
6. Set wildcard DNS for tenant subdomains: `*.yourdomain.com`.

## Customization Checklist

- [ ] Replace "My Company" branding in metadata and UI copy.
- [ ] Replace `apps/web/public/logo.svg` and `apps/web/public/placeholder.svg`.
- [ ] Update privacy and terms pages for your legal entity.
- [ ] Create Stripe products/prices and seed `subscription_plans`.
- [ ] Build your product in `(tenant-sites)/` and dashboard modules.
- [ ] Configure custom domain verification in `/api/domains`, or remove it if not needed.
- [ ] Replace optional email delivery (`RESEND_API_KEY`) with your provider if desired.
- [ ] Add optional error monitoring with Sentry (see [Sentry Setup](#sentry-setup-optional)).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server after build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript |
| `npm run check` | Type-check and lint |
| `npm run supabase:start` | Start local Supabase |
| `npm run supabase:stop` | Stop local Supabase |
| `npm run supabase:db:push` | Apply migrations |
| `npm run db:types` | Generate TypeScript types from schema |

## Agent Guidance

This repo includes `CLAUDE.md` and `AGENTS.md` with setup notes for AI coding agents, MCP server recommendations, local commands, and instructions to fetch current Supabase, Stripe, Vercel, and Next.js docs before changing integrations.

## Contributing

Contributions are welcome. This project uses a **review-gated pull request workflow** —
every change is merged only after review and approval by the repository owner. Direct
pushes to the default branch are not accepted.

### Workflow

1. **Fork** the repository and create a feature branch from the default branch:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your changes, keeping the starter **generic and reusable** (no product-specific
   or domain logic — see `AGENTS.md`).
3. Run the checks locally before pushing:
   ```bash
   npm run check     # type-check + lint
   npm run build
   ```
4. Open a **pull request** against the default branch with a clear description of the
   change and its motivation.
5. A maintainer will review your PR. **All pull requests require an approving review from
   the repository owner before they can be merged.** Address review feedback by pushing
   additional commits to the same branch.

### Guidelines

- Keep PRs focused and reasonably small; split unrelated changes.
- Don't commit secrets — `.env.local`, real keys, DSNs, or tokens.
- Don't reintroduce hardcoded private URLs, organization names, or account-specific IDs.
- Update docs (`README.md`, `AGENTS.md`, `CLAUDE.md`) when setup or behavior changes.
- Follow current Supabase, Stripe, Vercel, and Next.js docs for integration changes.

> **Maintainers:** enable branch protection on the default branch with **"Require a pull
> request before merging"** and **"Require review from Code Owners"** (or require an
> approval from the repository owner) so this policy is enforced automatically.

## License

MIT — use freely for commercial and open-source projects.
