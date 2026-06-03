/**
 * Horizontal layout for dashboard inner pages: use the full main column (beside sidebar),
 * not a centered max-w-7xl column.
 */
export const DASHBOARD_PAGE_GUTTER =
  'mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12'

/** Page background aligned with dashboard home (soft sky wash). */
export const DASHBOARD_SOFT_SURFACE =
  'min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/25 to-slate-50'

/** Primary card / section surface — sky border + light shadow */
export const DASHBOARD_PANEL_SKY =
  'rounded-2xl border border-sky-200/35 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_-10px_rgba(56,189,248,0.08)]'
