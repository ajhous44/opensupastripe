import Link from 'next/link'
import { INTEGRATION_PAGES, INTEGRATION_SLUGS, type IntegrationSlug } from '@/lib/marketing/platform-integration-pages'
import { IntegrationBrandLogo } from '@/components/marketing/IntegrationBrandLogo'
import { cn } from '@/lib/utils'
import { LayoutGrid } from 'lucide-react'

/**
 * Left rail navigation between integration pages. `activeSlug === null` highlights the hub;
 * otherwise the matching platform row is active.
 */
export function IntegrationsLogoNav({
  activeSlug,
  className,
}: {
  /** `null` = integrations hub is current page */
  activeSlug: string | null
  className?: string
}) {
  return (
    <nav
      className={cn(
        'w-full max-w-full shrink-0 lg:w-52 lg:max-w-[13rem]',
        'rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60',
        /* Sticks under fixed MarketingHeader (pt-4 + bar ≈ 7rem). Parent flex row uses lg:items-start + lg:self-start so the column isn’t stretch-tall. */
        'lg:z-10 lg:self-start lg:sticky lg:top-28',
        className
      )}
      aria-label="Platform integrations"
    >
      <p className="mb-2 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Integrations
      </p>
      <ul className="flex flex-col gap-1">
        <li>
          <Link
            href="/integrations"
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors',
              activeSlug === null
                ? 'bg-cyan-500/15 text-cyan-900 ring-1 ring-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </span>
            <span>Overview</span>
          </Link>
        </li>
        {INTEGRATION_SLUGS.map((slug) => {
          const p = INTEGRATION_PAGES[slug]
          const isActive = activeSlug === slug
          const alt = `${p.navTitle} logo`
          return (
            <li key={slug}>
              <Link
                href={`/integrations/${slug}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-900 ring-1 ring-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                )}
              >
                <IntegrationBrandLogo platform={slug as IntegrationSlug} alt={alt} decorative className="h-9 w-9" />
                <span>{p.navTitle}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
