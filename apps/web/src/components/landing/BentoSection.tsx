'use client'

import { motion } from 'framer-motion'
import Section from '@/components/Section'
import BentoDemo from '@/components/landing/BentoDemo'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { Zap } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

export default function BentoSection() {
  return (
    <Section className="bg-white dark:bg-black">
      <motion.div
        className="mx-auto max-w-6xl px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
        variants={cardVariants}
      >
        <div className="mb-12 text-center space-y-4">
          <motion.div
            variants={cardVariants}
            className="relative inline-flex items-center justify-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] shadow-sm shadow-indigo-500/20"
          >
            <Zap className="h-4 w-4 text-indigo-400" />
            <AnimatedGradientText className="text-indigo-400">
              Features To Help You Win
            </AnimatedGradientText>
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need To Compete
          </h2>
        </div>
        <BentoDemo />
      </motion.div>
    </Section>
  )
}
