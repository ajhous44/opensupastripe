'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type LayoutTextFlipProps = {
  text: string
  words: string[]
  duration?: number
  staticClassName?: string
  flipWrapperClassName?: string
  className?: string
  reserveWidth?: boolean
  clip?: boolean
}

export function LayoutTextFlip({
  text,
  words,
  duration = 3000,
  staticClassName,
  flipWrapperClassName,
  className,
  reserveWidth = true,
  clip = true,
}: LayoutTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const minCh = useMemo(() => {
    if (words.length === 0) return 12
    return Math.max(...words.map((w) => w.length), 8)
  }, [words])

  useEffect(() => {
    if (words.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, duration)
    return () => clearInterval(interval)
  }, [words.length, duration])

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <motion.span layout="position" className={cn('inline-block', staticClassName)}>
        {text}
      </motion.span>
      <motion.span
        layout
        className={cn(
          'relative inline-block min-h-[1.12em] align-baseline',
          clip ? 'overflow-hidden' : 'overflow-visible',
          flipWrapperClassName,
        )}
        style={reserveWidth ? { minWidth: `${minCh + 1}ch` } : undefined}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={currentIndex}
            initial={{ y: -36, filter: 'blur(8px)', opacity: 0 }}
            animate={{
              y: 0,
              filter: 'blur(0px)',
              opacity: 1,
            }}
            exit={{ y: 28, filter: 'blur(8px)', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block whitespace-nowrap text-blue-600 underline decoration-blue-500/30 decoration-2 underline-offset-[0.2em] dark:text-blue-400"
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}
