import Link from 'next/link'
import { DASHBOARD_PANEL_SKY } from '@/lib/dashboard-page-gutter'

type PaidPlanUpgradeOverlayProps = {
  title: string
  description: string
  upgradeHref?: string
}

/**
 * Blocks interaction with blurred content behind; parent should be
 * `relative min-h-[100dvh]` so the panel centers in the viewport.
 */
export function PaidPlanUpgradeOverlay({
  title,
  description,
  upgradeHref = '/dashboard/manage-subscription',
}: PaidPlanUpgradeOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-white/90 via-sky-50/50 to-white/90 p-4 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paid-plan-upgrade-title"
    >
      <div className={`${DASHBOARD_PANEL_SKY} max-w-sm p-6 text-center ring-1 ring-sky-300/20`}>
        <h2 id="paid-plan-upgrade-title" className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        <Link
          href={upgradeHref}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400/45 focus:ring-offset-2"
        >
          Upgrade now
        </Link>
      </div>
    </div>
  )
}
