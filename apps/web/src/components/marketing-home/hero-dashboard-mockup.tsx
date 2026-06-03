'use client'

import { BorderBeam } from '@/components/ui/border-beam'

export function HeroDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-background/70 shadow-[0_24px_80px_-32px_rgba(59,130,246,0.35)]">
      <div className="flex min-h-[280px] sm:min-h-[340px]" aria-hidden>
        <div className="hidden w-44 shrink-0 border-r border-line bg-muted/50 p-4 sm:block">
          <div className="mb-6 h-8 w-24 rounded-lg bg-blue-500/20" />
          <div className="space-y-2">
            {['Dashboard', 'Team', 'Billing', 'Settings'].map((label) => (
              <div
                key={label}
                className="h-8 rounded-lg bg-foreground/[0.04] px-3 text-xs leading-8 text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-7 w-40 rounded-lg bg-foreground/10" />
            <div className="h-9 w-28 rounded-full bg-blue-600/20" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-line bg-muted/30 p-4">
                <div className="mb-2 h-3 w-16 rounded bg-foreground/10" />
                <div className="h-6 w-20 rounded bg-foreground/15" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-line bg-muted/20 p-4">
            <div className="mb-3 h-3 w-32 rounded bg-foreground/10" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-foreground/[0.06]" />
              <div className="h-2 w-[92%] rounded bg-foreground/[0.06]" />
              <div className="h-2 w-[78%] rounded bg-foreground/[0.06]" />
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <BorderBeam size={120} duration={9} borderWidth={1.5} colorFrom="#3b82f6" colorTo="#22d3ee" />
        <BorderBeam
          size={120}
          duration={9}
          delay={4.5}
          borderWidth={1.5}
          colorFrom="#3b82f6"
          colorTo="#22d3ee"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            'linear-gradient(to top, var(--background) 0%, color-mix(in oklch, var(--background) 90%, transparent) 8%, color-mix(in oklch, var(--background) 55%, transparent) 24%, transparent 52%)',
        }}
        aria-hidden
      />
    </div>
  )
}
