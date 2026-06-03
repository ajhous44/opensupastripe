'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type GlowingCardProps = {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowingCard({
  children,
  className,
  glowColor = 'rgba(59, 130, 246, 0.35)',
}: GlowingCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group/glow relative isolate overflow-hidden rounded-3xl border border-line bg-background transition-colors',
        className
      )}
      style={{
        ['--glow-color' as string]: glowColor,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow-color), transparent 60%)',
        }}
      />
      <div className="relative z-[1] h-full w-full">{children}</div>
    </div>
  )
}
