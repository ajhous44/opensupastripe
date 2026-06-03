import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Small status pill used across dashboard tables/cards. Styled in the dashboard's
 * sky/slate language (the app's established palette) so it stays visually
 * consistent with PANEL_SKY surfaces.
 */
export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  warning: 'border-amber-200 bg-amber-100 text-amber-900',
  danger: 'border-red-200 bg-red-100 text-red-800',
}

const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-400',
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /** Render a leading status dot. */
  dot?: boolean
}

export function Badge({ variant = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASSES[variant])} aria-hidden /> : null}
      {children}
    </span>
  )
}
