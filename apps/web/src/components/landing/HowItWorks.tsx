'use client'

import { motion } from 'framer-motion'
import Section from '@/components/Section'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

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

const floatingCardVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

const steps = [
  {
    step: '1',
    title: 'Sign Up FREE',
    description: 'Create your account in 2 minutes. No credit card, no commitments, no risk.',
    color: 'from-blue-500 to-cyan-500',
    time: '2 mins',
    icon: '\u270D\uFE0F',
  },
  {
    step: '2',
    title: 'Add Your Info',
    description:
      'Upload your logo, add organization details, and list your cars. Our simple wizard walks you through it.',
    color: 'from-purple-500 to-pink-500',
    time: '5 mins',
    icon: '\uD83C\uDFEA',
  },
  {
    step: '3',
    title: 'Go LIVE!',
    description:
      'Your professional website goes live instantly. Start getting found by customers searching for cars.',
    color: 'from-green-500 to-emerald-500',
    time: '1 min',
    icon: '\uD83D\uDE80',
  },
]

export default function HowItWorks() {
  return (
    <Section className="bg-white dark:bg-black">
      <motion.div
        className="mx-auto max-w-7xl px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={cardVariants}>
          <motion.div
            className="inline-flex items-center justify-center mb-6 rounded-full bg-gradient-to-r from-blue-600/10 to-violet-600/10 px-6 py-3 backdrop-blur-sm border border-blue-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="mr-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">
              HOW IT WORKS
            </span>
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
            From zero to online in
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              {' '}
              3 simple steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            No computer science degree required. If you can check email, you can do this.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-12" variants={containerVariants}>
          {steps.map((item, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <motion.div
                className="bg-white dark:bg-white/5 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 dark:border-white/10 h-full backdrop-blur-sm"
                variants={floatingCardVariants}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <div className="text-3xl">{item.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item.time}
                </div>
              </motion.div>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  )
}
