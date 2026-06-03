import Link from 'next/link'
import {
  Building2,
  CreditCard,
  Database,
  Globe,
  LayoutGrid,
  Mail,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEATURE_PAGES, FEATURE_SLUGS, type FeatureSlug } from '@/lib/marketing/platform-feature-pages'

const FEATURE_ICONS: Record<FeatureSlug, LucideIcon> = {
  'multitenant-workspaces': Building2,
  'team-permissions': UserCog,
  'stripe-billing': CreditCard,
  'supabase-auth': Database,
  'custom-domains': Globe,
  'organization-invites': Mail,
}

export function FeaturesLogoNav({
  activeSlug,
  className,
}: {
  activeSlug: string | null
  className?: string
}) {
  return (
    <nav
      className={cn(
        'w-full max-w-full shrink-0 lg:w-52 lg:max-w-[13rem]',
        'rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60',
        'lg:z-10 lg:self-start lg:sticky lg:top-28',
        className
      )}
      aria-label="Product features"
    >
      <p className="mb-2 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Features
      </p>
      <ul className="flex flex-col gap-1">
        <li>
          <Link
            href="/features"
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors',
              activeSlug === null
                ? 'bg-indigo-500/15 text-indigo-900 ring-1 ring-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </span>
            <span>Overview</span>
          </Link>
        </li>
        {FEATURE_SLUGS.map((slug) => {
          const p = FEATURE_PAGES[slug]
          const isActive = activeSlug === slug
          const Icon = FEATURE_ICONS[slug]
          return (
            <li key={slug}>
              <Link
                href={`/features/${slug}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-900 ring-1 ring-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="leading-snug">{p.navTitle}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
