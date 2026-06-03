'use client'

import { motion } from 'framer-motion'
import Particles from '@/components/ui/particles'

export default function ParticleTextSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={140}
        ease={80}
        color="#000000"
        size={0.6}
        staticity={50}
        refresh={false}
      />
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={100}
        ease={80}
        color="#000000"
        size={0.5}
        staticity={50}
        refresh={false}
      />

      {/* Centered Text Content */}
      <motion.div
        className="relative z-10 text-center px-6 sm:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <h2 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl font-[var(--font-inter)]">
          Particle Text
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-700 sm:text-xl">
          Beautiful animated particles create an engaging visual experience
        </p>
      </motion.div>
    </section>
  )
}

