'use client'

import { motion } from 'framer-motion'
import Section from '@/components/Section'
import AnimatedBeamDemo from '@/components/marketing/AnimatedBeamDemo'

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

export default function IntegrationBeam() {
  return (
    <Section className="bg-white dark:bg-black pb-0 mb-16 md:mb-0">
      <motion.div
        className="mx-auto max-w-6xl px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
        variants={cardVariants}
      >
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
          {/* Left side - Text content */}
          <motion.div className="flex-1 space-y-4 text-center lg:text-left" variants={cardVariants}>
            <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-gray-300">
              Platform stack
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Connected by design
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 lg:mx-0">
              Supabase, Stripe, and Vercel work together out of the box. Auth events, billing webhooks, and tenant
              routing stay in sync across your stack.
            </p>
          </motion.div>

          {/* Right side - Animated beams */}
          <motion.div className="flex-1 w-full" variants={cardVariants}>
            <AnimatedBeamDemo />
          </motion.div>
        </div>
      </motion.div>
    </Section>
  )
}
