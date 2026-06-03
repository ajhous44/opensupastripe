'use client'

import { motion } from 'framer-motion'
import Section from '@/components/Section'

export default function ValueProp() {
  return (
    <Section className="bg-white dark:bg-black py-16">
      <motion.p
        className="mx-auto max-w-3xl text-center text-2xl font-semibold italic tracking-tight text-gray-900 dark:text-white sm:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        Marketing agencies charge thousands for websites, landing pages, and video we create in
        seconds. We charge $99.99/mo because we think that&apos;s insane too.
      </motion.p>
    </Section>
  )
}
