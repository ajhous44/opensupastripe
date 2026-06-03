'use client'

import { useEffect } from 'react'
import { motion, stagger, useAnimate, useInView } from 'framer-motion'

import { cn } from '@/lib/utils'

type TextGenerateEffectProps = {
  words: string
  className?: string
  accentClassName?: string
  accentWords?: string[]
  duration?: number
  filter?: boolean
}

export function TextGenerateEffect({
  words,
  className,
  accentClassName = 'text-blue-600',
  accentWords = [],
  duration = 0.5,
  filter = true,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope, { once: true, margin: '-10% 0px' })
  const wordsArray = words.split(' ')

  useEffect(() => {
    if (!isInView) return
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration,
        delay: stagger(0.08),
      }
    )
  }, [animate, duration, filter, isInView])

  const accentSet = new Set(accentWords.map((word) => word.replace(/[.,!?;:]/g, '').toLowerCase()))

  return (
    <motion.span ref={scope} className={cn('inline', className)}>
      {wordsArray.map((word, idx) => {
        const key = word.replace(/[.,!?;:]/g, '').toLowerCase()
        const isAccent = accentSet.has(key)
        return (
          <motion.span
            key={`${word}-${idx}`}
            className={cn('inline-block opacity-0', isAccent ? accentClassName : undefined)}
            style={{
              filter: filter ? 'blur(10px)' : 'none',
            }}
          >
            {word}
            {idx < wordsArray.length - 1 ? '\u00A0' : ''}
          </motion.span>
        )
      })}
    </motion.span>
  )
}
