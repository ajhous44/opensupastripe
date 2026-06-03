/**
 * Shared reporting-period model for dashboard analytics (overview + insights).
 * Windows are computed in the viewer's local time (correct for single-location
 * organizations); see lib/datetime.ts for the storage/display timezone rules.
 */
export type PeriodKey = '7d' | '30d' | '90d' | 'mtd' | 'ytd' | '12m'

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'mtd', label: 'Month to date' },
  { key: 'ytd', label: 'Year to date' },
  { key: '12m', label: 'Last 12 months' },
]

export function periodLabel(key: PeriodKey): string {
  return PERIOD_OPTIONS.find((o) => o.key === key)?.label ?? ''
}

/** Epoch ms for (year, month, day), clamping the day to the month's last day (avoids Apr-31 → May-1 overflow). */
function clampedTime(year: number, month: number, day: number, hours: number, minutes: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay), hours, minutes).getTime()
}

/** Current + previous comparison windows (epoch ms). The current window ends "now". */
export function periodRange(key: PeriodKey): { curStart: number; prevStart: number; prevEnd: number } {
  const now = new Date()
  const nowMs = now.getTime()
  const day = 24 * 60 * 60 * 1000
  switch (key) {
    case '7d':
      return { curStart: nowMs - 7 * day, prevStart: nowMs - 14 * day, prevEnd: nowMs - 7 * day }
    case '90d':
      return { curStart: nowMs - 90 * day, prevStart: nowMs - 180 * day, prevEnd: nowMs - 90 * day }
    case '12m':
      return { curStart: nowMs - 365 * day, prevStart: nowMs - 730 * day, prevEnd: nowMs - 365 * day }
    case 'mtd':
      return {
        curStart: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        prevStart: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
        prevEnd: clampedTime(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes()),
      }
    case 'ytd':
      return {
        curStart: new Date(now.getFullYear(), 0, 1).getTime(),
        prevStart: new Date(now.getFullYear() - 1, 0, 1).getTime(),
        prevEnd: clampedTime(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()),
      }
    case '30d':
    default:
      return { curStart: nowMs - 30 * day, prevStart: nowMs - 60 * day, prevEnd: nowMs - 30 * day }
  }
}
