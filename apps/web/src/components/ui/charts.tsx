import { cn } from '@/lib/utils'

/**
 * Lightweight, dependency-free, responsive charts in the dashboard's flat
 * sky/slate language. SVG for the trend + donut; CSS for bars (sharp at any
 * size). Intentionally minimal — no axes/tooltips beyond title attributes.
 */

export type Point = { label: string; value: number }

function maxOf(data: { value: number }[]): number {
  return Math.max(1, ...data.map((d) => d.value))
}

function EmptyChart({ height, label }: { height: number; label?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400"
      style={{ height }}
    >
      {label ?? 'No data yet'}
    </div>
  )
}

/** Area + line trend. preserveAspectRatio=none + non-scaling stroke = full-width, fixed-height, sharp line. */
export function AreaTrend({
  data,
  height = 120,
  className,
}: {
  data: Point[]
  height?: number
  className?: string
}) {
  if (!data.length) return <EmptyChart height={height} />
  const max = maxOf(data)
  const W = 100
  const H = 100
  const n = data.length
  const pts = data.map((d, i) => {
    const x = n === 1 ? W / 2 : (i / (n - 1)) * W
    const y = H - (d.value / max) * (H - 8) - 4
    return [x, y] as const
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
  const area = `${line} L ${W} ${H} L 0 ${H} Z`
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      role="img"
      aria-label="Trend"
    >
      <defs>
        <linearGradient id="afAreaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(2,132,199)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(2,132,199)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#afAreaSky)" />
      <path
        d={line}
        fill="none"
        stroke="rgb(2,132,199)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Vertical bars (CSS). */
export function VBars({ data, height = 150, className }: { data: Point[]; height?: number; className?: string }) {
  if (!data.length) return <EmptyChart height={height} />
  const max = maxOf(data)
  return (
    <div className={cn('flex items-stretch gap-2', className)} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] tabular-nums text-slate-400">{d.value || ''}</span>
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-[30px] rounded-t-md bg-sky-500/80"
              style={{ height: `${Math.round((d.value / max) * 100)}%`, minHeight: d.value > 0 ? 3 : 0 }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

type Tone = 'sky' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo'
const TONE_BG: Record<Tone, string> = {
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
}

/** Horizontal labelled bars (CSS) — funnels, breakdowns. */
export function HBars({
  data,
  className,
}: {
  data: { label: string; value: number; tone?: Tone }[]
  className?: string
}) {
  if (!data.length) return <EmptyChart height={120} />
  const max = maxOf(data)
  return (
    <div className={cn('space-y-2.5', className)}>
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="capitalize text-slate-600">{d.label}</span>
            <span className="font-medium tabular-nums text-slate-900">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full', TONE_BG[d.tone ?? 'sky'])}
              style={{ width: `${Math.round((d.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Small period-over-period delta chip. prev undefined → nothing rendered. */
function DeltaChip({ value, prev }: { value: number; prev?: number }) {
  if (prev === undefined) return null
  if (prev === 0 && value === 0) return null
  if (prev === 0) return <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">new</span>
  const pct = Math.round(((value - prev) / prev) * 100)
  if (pct === 0) return <span className="text-[10px] font-medium text-slate-400">→ 0%</span>
  const up = pct > 0
  return (
    <span className={cn('text-[10px] font-semibold tabular-nums', up ? 'text-emerald-600' : 'text-rose-500')}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

/** Ranked horizontal bars with a count and period-over-period delta — demand themes. */
export function RankedDemand({
  data,
  className,
}: {
  data: { label: string; value: number; prev?: number; tone?: Tone }[]
  className?: string
}) {
  if (!data.length) return <EmptyChart height={120} label="No demand signal yet" />
  const max = maxOf(data)
  return (
    <div className={cn('space-y-2.5', className)}>
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate capitalize text-slate-700">{d.label}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="font-medium tabular-nums text-slate-900">{d.value}</span>
              <DeltaChip value={d.value} prev={d.prev} />
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full', TONE_BG[d.tone ?? 'sky'])}
              style={{ width: `${Math.round((d.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Donut with legend (SVG). */
export function Donut({
  data,
  size = 132,
  className,
}: {
  data: { label: string; value: number; color: string }[]
  size?: number
  className?: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 42
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className={cn('flex items-center gap-5', className)}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0" role="img" aria-label="Breakdown">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {total > 0 &&
          data.map((d, i) => {
            const frac = d.value / total
            const seg = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="12"
                strokeDasharray={`${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`}
                strokeDashoffset={(-acc * c).toFixed(2)}
                transform="rotate(-90 50 50)"
              />
            )
            acc += frac
            return seg
          })}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 16, fontWeight: 600 }} className="fill-slate-900">
          {total}
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="truncate capitalize text-slate-600">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums text-slate-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
