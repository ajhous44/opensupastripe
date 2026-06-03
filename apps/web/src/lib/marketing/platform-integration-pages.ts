/**
 * Marketing integration hub content — Stripe, Supabase, Vercel.
 */

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export const INTEGRATIONS_DOCS_URL = 'https://github.com/'

export type IntegrationCategoryId = 'backend' | 'hosting' | 'billing'

export type IntegrationSlug = 'stripe' | 'supabase' | 'vercel'

export interface IntegrationPageContent {
  platform: IntegrationSlug
  slug: IntegrationSlug
  categoryId: IntegrationCategoryId
  categoryLabel: string
  navTitle: string
  metaTitle: string
  metaDescription: string
  ogTitle: string
  h1: string
  leadHtml: string
  benefitsHtml: string
  valueProps: string[]
  howItWorks: string[]
  partnerSetup: string
  specReferences?: { label: string; href: string }[]
  faq: { question: string; answer: string }[]
}

function page(
  slug: IntegrationSlug,
  categoryId: IntegrationCategoryId,
  categoryLabel: string,
  navTitle: string,
  h1: string,
  lead: string
): IntegrationPageContent {
  return {
    platform: slug,
    slug,
    categoryId,
    categoryLabel,
    navTitle,
    metaTitle: `${navTitle} integration | My Company`,
    metaDescription: lead.replace(/<[^>]+>/g, ''),
    ogTitle: `${navTitle} | My Company`,
    h1,
    leadHtml: `<p>${lead}</p>`,
    benefitsHtml: `<p>Connect ${navTitle} to your multitenant SaaS without rebuilding auth, billing, or team flows from scratch.</p>`,
    valueProps: [
      'Environment variables documented in .env.example',
      'Production patterns extracted from a real SaaS codebase',
      'Works with local development and Vercel preview deployments',
    ],
    howItWorks: [
      'Configure API keys in your environment',
      'Run database migrations for core schema',
      'Start the Next.js dev server and test auth + billing flows',
      'Deploy to Vercel with matching environment variables',
    ],
    partnerSetup: `Follow the ${navTitle} dashboard for API keys, webhooks, and production checklist items.`,
    specReferences: [
      { label: `${navTitle} documentation`, href: 'https://example.com/docs' },
    ],
    faq: [
      {
        question: `Do I need ${navTitle} for local development?`,
        answer: 'Marketing pages work without Supabase. Auth, dashboard, and billing require Supabase and Stripe configuration.',
      },
      {
        question: 'Can I swap providers?',
        answer: 'Yes. This starter isolates billing and auth behind server actions and repository patterns so you can adapt integrations.',
      },
    ],
  }
}

export const INTEGRATION_PAGES: Record<IntegrationSlug, IntegrationPageContent> = {
  supabase: page(
    'supabase',
    'backend',
    'Backend & auth',
    'Supabase',
    'Supabase auth, Postgres, and RLS',
    'Organizations, profiles, team members, and subscriptions with row-level security and SSR cookie sessions.'
  ),
  vercel: page(
    'vercel',
    'hosting',
    'Hosting & deploy',
    'Vercel',
    'Deploy on Vercel',
    'Next.js App Router hosting with preview URLs, environment variables, and Stripe webhook endpoints.'
  ),
  stripe: page(
    'stripe',
    'billing',
    'Billing & payments',
    'Stripe',
    'Stripe subscriptions and customer portal',
    'Checkout, webhooks, subscription plans, and manage-subscription dashboard powered by Stripe.'
  ),
}

export const INTEGRATION_SLUGS = Object.keys(INTEGRATION_PAGES) as IntegrationSlug[]

export function getIntegrationPage(slug: string): IntegrationPageContent | null {
  if (!(INTEGRATION_SLUGS as readonly string[]).includes(slug)) return null
  return INTEGRATION_PAGES[slug as IntegrationSlug]
}

export function integrationCanonicalUrl(slug: string): string {
  return `${SITE}/integrations/${slug}`
}

export function formatIntegrationName(slug: IntegrationSlug): string {
  return INTEGRATION_PAGES[slug].navTitle
}
