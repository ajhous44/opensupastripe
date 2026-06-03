'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT'

type CommonProps = {
  containerClassName?: string
  className?: string
  duration?: number
  clockwise?: boolean
  children: ReactNode
}

type LinkProps = CommonProps & {
  href: string
  onClick?: never
  type?: never
}

type ButtonProps = CommonProps & {
  href?: undefined
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export type HoverBorderGradientProps = LinkProps | ButtonProps

const rotateDirection = (current: Direction, clockwise: boolean): Direction => {
  const order: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT']
  const index = order.indexOf(current)
  const next = clockwise ? (index - 1 + order.length) % order.length : (index + 1) % order.length
  return order[next]!
}

const movingMap: Record<Direction, string> = {
  TOP: 'radial-gradient(20.7% 50% at 50% 0%, rgba(59,130,246,0.85) 0%, rgba(59,130,246,0) 100%)',
  LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, rgba(6,182,212,0.85) 0%, rgba(6,182,212,0) 100%)',
  BOTTOM:
    'radial-gradient(20.7% 50% at 50% 100%, rgba(124,58,237,0.85) 0%, rgba(124,58,237,0) 100%)',
  RIGHT:
    'radial-gradient(16.2% 41.2% at 100% 50%, rgba(99,102,241,0.85) 0%, rgba(99,102,241,0) 100%)',
}

const highlight =
  'radial-gradient(75% 181.15% at 50% 50%, rgba(59,130,246,0.92) 0%, rgba(59,130,246,0) 100%)'

export function HoverBorderGradient(props: HoverBorderGradientProps) {
  const { containerClassName, className, duration = 1, clockwise = true, children } = props
  const [hovered, setHovered] = useState(false)
  const [direction, setDirection] = useState<Direction>('TOP')

  useEffect(() => {
    if (hovered) return
    const interval = setInterval(() => {
      setDirection((prev) => rotateDirection(prev, clockwise))
    }, duration * 1000)
    return () => clearInterval(interval)
  }, [hovered, duration, clockwise])

  const shell = (
    <>
      <div
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 rounded-[inherit] bg-foreground px-7 py-3.5 text-[0.9375rem] font-medium text-white dark:text-black',
          className,
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ filter: 'blur(2px)' }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: 'linear', duration: duration ?? 1 }}
      />
      <div className="absolute inset-[2px] z-[1] rounded-[100px] bg-foreground" />
    </>
  )

  const shellClasses = cn(
    'relative inline-flex items-center justify-center overflow-hidden rounded-full border border-line-strong bg-background/80 p-px backdrop-blur transition duration-500',
    containerClassName,
  )

  if ('href' in props && props.href !== undefined) {
    return (
      <Link
        href={props.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={shellClasses}
      >
        {shell}
      </Link>
    )
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={shellClasses}
    >
      {shell}
    </button>
  )
}
