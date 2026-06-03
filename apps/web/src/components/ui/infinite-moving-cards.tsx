'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type InfiniteMovingCardsProps = {
  items: Array<{ id: string; node: ReactNode }>
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
}

export function InfiniteMovingCards({
  items,
  direction = 'left',
  speed = 'slow',
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const scroller = scrollerRef.current
    if (!container || !scroller || container.dataset.ready === 'true') return

    const scrollerContent = Array.from(scroller.children)
    scrollerContent.forEach((item) => {
      const duplicate = item.cloneNode(true) as HTMLElement
      duplicate.setAttribute('aria-hidden', 'true')
      scroller.appendChild(duplicate)
    })

    container.style.setProperty('--animation-direction', direction === 'left' ? 'forwards' : 'reverse')
    container.style.setProperty(
      '--animation-duration',
      speed === 'fast' ? '24s' : speed === 'normal' ? '48s' : '80s'
    )

    container.dataset.ready = 'true'
  }, [direction, speed])

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-10 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4',
          'animate-[scroll_var(--animation-duration)_linear_infinite]',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            {item.node}
          </li>
        ))}
      </ul>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.5rem)); }
        }
      `}</style>
    </div>
  )
}
