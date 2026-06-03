/**
 * Canonical date/time formatting helpers.
 *
 * Storage is always UTC (Postgres `timestamptz`). Display rules:
 *  - Absolute moments with no inherent place (created_at, activity, "x ago") →
 *    the viewer's local timezone — use `formatRelativeTime` or plain `toLocale*`.
 *  - Times that mean a specific place's wall clock (organization hours, appointment
 *    slots, "open until 6pm") → format in the DEALERSHIP timezone via
 *    `formatInTimeZone`, and label it with `tzGenericLabel` so it is unambiguous
 *    to an out-of-area shopper.
 *
 * For any absolute timestamp rendered during SSR, pass an explicit `timeZone`.
 * Without it, `Intl`/`toLocale*` use the server's zone (UTC on Vercel) on the
 * server and the browser's zone on hydration, which produces a wrong-time flash
 * and a React hydration mismatch.
 */

const FALLBACK_TZ = 'America/New_York'

/** Format an absolute instant in an explicit IANA timezone (SSR-safe). */
export function formatInTimeZone(
  value: string | number | Date,
  timeZone: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const tz = timeZone || FALLBACK_TZ
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...options }).format(date)
  } catch {
    // Invalid IANA id — never throw during render.
    return new Intl.DateTimeFormat('en-US', { timeZone: FALLBACK_TZ, ...options }).format(date)
  }
}

/** Short abbreviation for the zone at a moment, e.g. "EST" / "CDT". */
export function tzAbbreviation(timeZone: string | null | undefined, at: Date = new Date()): string {
  const tz = timeZone || FALLBACK_TZ
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(at)
    return parts.find((p) => p.type === 'timeZoneName')?.value || tz
  } catch {
    return tz
  }
}

/**
 * Generic, DST-agnostic label for a zone, e.g. "Eastern Time".
 * Stable across Standard/Daylight so it is safe to render on the server and the
 * client without a hydration mismatch.
 */
export function tzGenericLabel(timeZone: string | null | undefined, at: Date = new Date()): string {
  const tz = timeZone || FALLBACK_TZ
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'long' }).formatToParts(at)
    const long = parts.find((p) => p.type === 'timeZoneName')?.value
    return long ? long.replace(/\b(Standard|Daylight|Summer)\s+/i, '') : tz
  } catch {
    return tz
  }
}

/** Relative "x ago" for recent absolute moments (timezone-agnostic). */
export function formatRelativeTime(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return ''
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
