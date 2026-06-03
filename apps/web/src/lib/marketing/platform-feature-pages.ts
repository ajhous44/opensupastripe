/**
 * Programmatic marketing content for /features and /features/[slug].
 */

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export type FeatureCategoryId = 'platform' | 'billing' | 'teams' | 'infrastructure'

export interface FeatureHighlight {
  title: string
  description: string
}

export interface FeaturePageContent {
  slug: FeatureSlug
  categoryId: FeatureCategoryId
  categoryLabel: string
  navTitle: string
  metaTitle: string
  metaDescription: string
  ogTitle: string
  h1: string
  leadHtml: string
  highlights: FeatureHighlight[]
  benefitsHtml: string
  valueProps: string[]
  howItWorks: string[]
  faq: { question: string; answer: string }[]
  heroImage: { src: string; alt: string; credit?: string }
  relatedLinks?: { href: string; label: string }[]
}

export const FEATURE_SLUGS = [
  'multitenant-workspaces',
  'team-permissions',
  'stripe-billing',
  'supabase-auth',
  'custom-domains',
  'organization-invites',
] as const

export type FeatureSlug = (typeof FEATURE_SLUGS)[number]

export function featureCanonicalUrl(slug: string): string {
  return `${SITE}/features/${slug}`
}

export function getFeaturePage(slug: string): FeaturePageContent | null {
  if (!isFeatureSlug(slug)) return null
  return FEATURE_PAGES[slug]
}

function isFeatureSlug(s: string): s is FeatureSlug {
  return (FEATURE_SLUGS as readonly string[]).includes(s)
}

const hero = { src: '/placeholder.svg', alt: 'My Company platform preview' }

function page(
  slug: FeatureSlug,
  categoryId: FeatureCategoryId,
  categoryLabel: string,
  navTitle: string,
  h1: string,
  lead: string
): FeaturePageContent {
  return {
    slug,
    categoryId,
    categoryLabel,
    navTitle,
    metaTitle: `${navTitle} | My Company`,
    metaDescription: lead,
    ogTitle: `${navTitle} — My Company`,
    h1,
    leadHtml: `<p>${lead}</p>`,
    highlights: [
      { title: 'Production-ready', description: 'Ship faster with patterns extracted from a real SaaS product.' },
      { title: 'Tenant isolation', description: 'Row-level security and middleware routing keep organizations separated.' },
      { title: 'Stripe-native billing', description: 'Subscriptions, trials, and customer portal out of the box.' },
    ],
    benefitsHtml: '<p>Extend the starter with your own product modules while keeping auth, billing, and teams intact.</p>',
    valueProps: ['Multitenant by default', 'Role-based access', 'Vercel + Supabase stack'],
    howItWorks: ['Create an organization', 'Invite teammates', 'Subscribe via Stripe', 'Deploy on Vercel'],
    faq: [
      { question: 'Can I customize this starter?', answer: 'Yes. Fork the repo and add your domain features on top of the core schema.' },
      { question: 'Does billing work locally?', answer: 'Use Stripe test mode and the included webhook handler during development.' },
    ],
    heroImage: hero,
    relatedLinks: [{ href: '/pricing', label: 'View pricing' }],
  }
}

export const FEATURE_PAGES: Record<FeatureSlug, FeaturePageContent> = {
  'multitenant-workspaces': page(
    'multitenant-workspaces',
    'platform',
    'Platform',
    'Multitenant workspaces',
    'Organizations as first-class tenants',
    'Each customer gets an isolated workspace with subdomain routing, settings, and billing context.'
  ),
  'team-permissions': page(
    'team-permissions',
    'teams',
    'Teams',
    'Team & roles',
    'Invite teammates with owner, admin, and staff roles',
    'Collaborate safely with role-based dashboard access and organization invites.'
  ),
  'stripe-billing': page(
    'stripe-billing',
    'billing',
    'Billing',
    'Stripe subscriptions',
    'Plans, trials, and customer portal',
    'Manage subscriptions with Stripe Checkout, webhooks, and a built-in billing dashboard.'
  ),
  'supabase-auth': page(
    'supabase-auth',
    'infrastructure',
    'Infrastructure',
    'Supabase auth & RLS',
    'SSR-friendly authentication',
    'Email/password auth with cookie-based SSR sessions and Postgres row-level security.'
  ),
  'custom-domains': page(
    'custom-domains',
    'platform',
    'Platform',
    'Custom domains',
    'Map customer domains to tenants',
    'Optional custom domain support with verification flows for production deployments.'
  ),
  'organization-invites': page(
    'organization-invites',
    'teams',
    'Teams',
    'Organization invites',
    'Email invites with secure tokens',
    'Onboard teammates through tokenized invite links and accept-invite flows.'
  ),
}
