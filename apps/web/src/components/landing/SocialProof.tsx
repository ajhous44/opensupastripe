import { motion } from 'framer-motion'
import Section from '@/components/Section'

export default function SocialProof() {
  const logos = [
    { name: 'Smith Auto', short: 'SMITH' },
    { name: 'Metro Motors', short: 'METRO' },
    { name: 'Prime Auto', short: 'PRIME' },
    { name: 'AutoHub', short: 'HUB' },
    { name: 'RoadReady', short: 'ROAD' },
  ]

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold tracking-wider text-gray-500">
            Trusted by independent organizations
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center">
          {logos.map((logo) => (
            <motion.div
              key={logo.name}
              className="flex h-16 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-700 shadow-sm"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-xs sm:text-sm font-semibold tracking-wide">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}


