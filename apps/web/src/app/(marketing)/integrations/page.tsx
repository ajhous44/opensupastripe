import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { IntegrationsMarketingHero } from '@/components/marketing/IntegrationsMarketingHero'
import { IntegrationsLogoNav } from '@/components/marketing/IntegrationsLogoNav'
import { BreadcrumbScript } from '@/lib/breadcrumb-jsonld'
import {
  INTEGRATION_PAGES,
  INTEGRATION_SLUGS,
  INTEGRATIONS_DOCS_URL,
  type IntegrationCategoryId,
} from '@/lib/marketing/platform-integration-pages'
import { ArrowRight, Cable, Layers, Megaphone, RefreshCw } from 'lucide-react'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
const CANONICAL = `${SITE}/integrations`

export const metadata: Metadata = {
  title: 'Platform integrations — Stripe, Supabase, Vercel',
  description:
    'Connect Stripe billing, Supabase auth and database, and Vercel deployment to your multitenant SaaS starter.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: 'Platform integrations | My Company',
    description:
      'Stripe, Supabase, and Vercel integrations for auth, billing, and deployment.',
  },
}

const hubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'My Company platform integrations',
  description:
    'Stripe, Supabase, and Vercel integrations for multitenant SaaS.',
  url: CANONICAL,
  isPartOf: { '@type': 'WebSite', name: 'My Company', url: SITE },
  about: {
    '@type': 'SoftwareApplication',
    name: 'My Company',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
  },
  dateModified: '2026-04-15',
}

const CATEGORY_ORDER: IntegrationCategoryId[] = ['backend', 'hosting', 'billing']

const CATEGORY_INTRO: Record<IntegrationCategoryId, string> = {
  backend: 'Database, auth, and row-level security for multitenant workspaces.',
  hosting: 'Hosting, previews, and production deployment on Vercel.',
  billing: 'Stripe Checkout, subscriptions, and customer billing portal.',
}

export default function IntegrationsHubPage() {
  const byCategory = CATEGORY_ORDER.map((id) => {
    const items = INTEGRATION_SLUGS.filter((s) => INTEGRATION_PAGES[s].categoryId === id)
    const label = items.length > 0 ? INTEGRATION_PAGES[items[0]].categoryLabel : ''
    return { id, label, items }
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <BreadcrumbScript items={[{ name: 'Integrations', path: '/integrations' }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }} />

      <MarketingHeader />

      <IntegrationsMarketingHero>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300/90">
            Platform / integrations
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3rem] lg:leading-[1.08]">
            Stack{' '}
            <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
              integrations
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300 md:text-xl md:leading-relaxed">
            My Company ships with <strong className="font-semibold text-white">Supabase</strong>,{' '}
            <strong className="font-semibold text-white">Stripe</strong>, and{' '}
            <strong className="font-semibold text-white">Vercel</strong> wired together—auth, billing webhooks, and
            deployment patterns extracted from a production multitenant SaaS codebase.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Megaphone,
              title: 'Auth & tenants',
              body: 'Supabase Auth with SSR cookies and RLS policies scoped by organization.',
            },
            {
              icon: Layers,
              title: 'One billing source',
              body: 'Stripe Checkout and webhooks keep subscription status synced to Postgres.',
            },
            {
              icon: Cable,
              title: 'Webhook-ready',
              body: 'Handle subscription events with typed handlers and idempotent updates.',
            },
            {
              icon: RefreshCw,
              title: 'Deploy anywhere',
              body: 'Vercel preview URLs and environment-based configuration for local and prod.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
            >
              <card.icon className="h-6 w-6 text-cyan-300" aria-hidden />
              <h2 className="mt-3 text-base font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.body}</p>
            </div>
          ))}
        </div>
      </IntegrationsMarketingHero>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start lg:gap-12 lg:px-8">
        <div className="order-1 min-w-0 flex-1 space-y-16 lg:order-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/40 md:p-10" aria-labelledby="docs-hub-heading">
          <h2 id="docs-hub-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Technical documentation
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Setup guides, environment variables, webhook details, and troubleshooting live in{' '}
            <a
              href={INTEGRATIONS_DOCS_URL}
              className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
              rel="noopener noreferrer"
            >
              My Company docs
            </a>
            — setup guides for Supabase, Stripe, and Vercel configuration.
          </p>
        </section>

        {byCategory.map((group) => (
          <section key={group.id}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {group.label}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{CATEGORY_INTRO[group.id]}</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((slug) => {
                const page = INTEGRATION_PAGES[slug]
                return (
                  <Link
                    key={slug}
                    href={`/integrations/${slug}`}
                    className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-500/40 hover:shadow-md dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-cyan-400/30"
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400/90">
                      {page.categoryLabel}
                    </span>
                    <span className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{page.navTitle}</span>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{page.metaDescription}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Read integration guide
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        <aside className="rounded-2xl border border-slate-200 bg-slate-100/80 p-6 dark:border-white/10 dark:bg-slate-900/50 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Related</h2>
          <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
            <li>
              <Link href="/features" className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400">
                Platform features — multitenant workspaces, teams, billing
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400">
                Pricing — Starter and Pro plans
              </Link>
            </li>
            <li>
              <span className="text-slate-600 dark:text-slate-400">
                Signed-in users: open{' '}
                <Link href="/dashboard/manage-subscription" className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400">
                  Manage Subscription
                </Link>{' '}
                to view billing and plans.
              </span>
            </li>
            <li>
              <a
                href={INTEGRATIONS_DOCS_URL}
                className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
              <span className="text-slate-600 dark:text-slate-400"> — technical reference</span>
            </li>
          </ul>
        </aside>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500">
          Canonical hub:{' '}
          <a href={CANONICAL} className="text-cyan-700 hover:underline dark:text-cyan-500">
            {CANONICAL.replace('https://', '')}
          </a>
        </p>
        </div>

        <IntegrationsLogoNav activeSlug={null} className="order-2 lg:order-1" />
      </div>

      <MarketingFooter />
    </div>
  )
}
