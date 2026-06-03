'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import MarketingHeader from '@/components/MarketingHeader'
import Section from '@/components/Section'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
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

const imageVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.05,
    rotate: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

const companyValues = [
  {
    name: 'Innovation',
    description: 'We extract production patterns from real SaaS products so teams can ship auth, billing, and multitenant foundations faster.',
    icon: '🚀',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Simplicity',
    description: 'Powerful tools should be easy to use. We make complex technology accessible to everyone.',
    icon: '✨',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Partnership',
    description: 'We are true partners in your success, providing hands-off automation and dedicated support.',
    icon: '🤝',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Evolution',
    description: 'Your website evolves automatically with market trends - no manual updates or redesigns needed.',
    icon: '🌱',
    color: 'from-orange-500 to-red-500'
  }
]

const teamMembers = [
  {
    name: 'Engineering',
    role: 'Product foundation',
    bio: 'Owns the Next.js, Supabase, Stripe, and Vercel patterns that make the starter useful out of the box.',
    skills: ['System Architecture', 'Security', 'Developer Experience']
  },
  {
    name: 'Product',
    role: 'SaaS workflows',
    bio: 'Focuses on reusable onboarding, team management, billing, and dashboard flows that product teams can adapt.',
    skills: ['Product Strategy', 'Customer Workflows', 'Operations']
  }
]

export default function AboutPageClient() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <MarketingHeader />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-gray-50/50 to-white">
          <motion.div
            className="mx-auto max-w-7xl px-6 lg:px-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="mx-auto max-w-4xl text-center mb-16" variants={cardVariants}>
              <motion.div
                className="inline-flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 backdrop-blur-sm border border-indigo-100/60 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  className="mr-3 h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0.4)",
                      "0 0 0 8px rgba(99, 102, 241, 0)",
                      "0 0 0 0 rgba(99, 102, 241, 0.4)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold text-gray-900 tracking-wide">ABOUT MY COMPANY</span>
              </motion.div>

              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Revolutionizing organization
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                  SaaS foundations
                </span>
              </h1>

              <p className="text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
                We package the common SaaS foundation — auth, organizations, billing, tenant routing, and dashboard flows — so teams can focus on their product.
              </p>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              className="relative mx-auto max-w-5xl"
              variants={cardVariants}
              whileHover="hover"
              initial="rest"
            >
              <motion.div
                className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200"
                variants={imageVariants}
              >
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=600&q=80"
                  alt="Team collaboration and innovation"
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20"
                animate={{
                  y: [0, 15, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
              />
            </motion.div>
          </motion.div>
        </Section>

        {/* Mission Section */}
        <Section className="bg-white">
          <motion.div
            className="mx-auto max-w-7xl px-6 lg:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              {/* Content */}
              <motion.div variants={cardVariants}>
                <motion.div
                  className="inline-flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 backdrop-blur-sm border border-green-100/60 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-semibold text-green-800 tracking-wide">OUR MISSION</span>
                </motion.div>

                <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                  Empowering organizations with
                  <span className="text-indigo-600"> intelligent automation</span>
                </h2>

                <p className="text-xl leading-8 text-gray-700 mb-6">
                  SaaS teams rebuild the same foundation again and again: auth, subscriptions, teams, route protection, and tenant isolation.
                </p>

                <p className="text-lg leading-8 text-gray-600 mb-8">
                  My Company turns those repeated setup tasks into a reusable open-source starter with production-oriented defaults and clear extension points.
                </p>

                <p className="text-lg leading-8 text-gray-600 mb-8">
                  We built My Company after shipping multitenant products with Supabase, Stripe, and Next.js—the same plumbing every SaaS team rebuilds from scratch. This starter packages organizations, team invites, subscription billing, and tenant routing so you can focus on your product instead of reinventing auth and payments.
                </p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    🚀 Experience the future
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 font-medium"
                  >
                    👀 See how it works
                  </Link>
                </motion.div>
              </motion.div>

              {/* Image */}
              <motion.div
                className="mt-12 lg:mt-0"
                variants={cardVariants}
                whileHover="hover"
                initial="rest"
              >
                <motion.div
                  className="rounded-3xl overflow-hidden shadow-2xl"
                  variants={imageVariants}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Modern software team collaboration"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* Values Section */}
        <Section className="bg-gradient-to-b from-gray-50/50 to-white">
          <motion.div
            className="mx-auto max-w-7xl px-6 lg:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Clean Header */}
            <motion.div className="mx-auto max-w-3xl text-center mb-16" variants={cardVariants}>
              <motion.div
                className="inline-flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border border-indigo-100 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <span className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                <span className="text-sm font-semibold text-indigo-600 tracking-wide">
                  CORE VALUES
                </span>
              </motion.div>

              <motion.h2
                className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                  }
                }}
              >
                Our guiding{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  principles
                </span>
              </motion.h2>

              <motion.p
                className="text-xl text-gray-600 leading-relaxed"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }
                  }
                }}
              >
                These principles guide everything we do and how we build the{" "}
                <span className="font-semibold text-indigo-600">
                  future of SaaS foundations
                </span>
              </motion.p>
            </motion.div>

            {/* Clean Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
              variants={containerVariants}
            >
              {companyValues.map((value, index) => (
                <motion.div
                  key={value.name}
                  className="group relative"
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 30,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }
                  }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                  }}
                >
                  {/* Clean Card */}
                  <div className="relative h-full min-h-[280px] bg-white rounded-2xl p-6 lg:p-8 shadow-lg ring-1 ring-gray-200/50 border border-gray-100 flex flex-col group-hover:shadow-xl group-hover:ring-indigo-200/30 transition-all duration-300">

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-2xl mb-6 shadow-lg flex-shrink-0 group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      {value.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                        {value.name}
                      </h3>

                      <p className="text-gray-600 leading-relaxed text-sm lg:text-base flex-1">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Section>

        {/* Team Section */}
        <Section className="bg-white">
          <motion.div
            className="mx-auto max-w-7xl px-6 lg:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="mx-auto max-w-2xl text-center mb-16" variants={cardVariants}>
              <motion.div
                className="inline-flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 backdrop-blur-sm border border-purple-100/60 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-semibold text-purple-800 tracking-wide">BUILT FOR BUILDERS</span>
              </motion.div>

              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                The foundations inside My Company
              </h2>
              <p className="text-xl text-gray-600">
                A practical starter shaped around the pieces most SaaS teams need before product-specific work begins.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              variants={containerVariants}
            >
              {teamMembers.map((person, _index) => (
                <motion.div
                  key={person.name}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      className="w-20 h-20 rounded-2xl overflow-hidden mr-6 shadow-lg ring-2 ring-indigo-200"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src="/logo.svg"
                        alt={person.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{person.name}</h3>
                      <p className="text-lg text-indigo-600 font-medium">{person.role}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">{person.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {person.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Section>

        {/* Technology Section */}
        <Section className="bg-gradient-to-b from-gray-50/50 to-white">
          <motion.div
            className="mx-auto max-w-7xl px-6 lg:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              {/* Image */}
              <motion.div
                className="mb-12 lg:mb-0"
                variants={cardVariants}
                whileHover="hover"
                initial="rest"
              >
                <motion.div
                  className="rounded-3xl overflow-hidden shadow-2xl"
                  variants={imageVariants}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&h=600&q=80"
                    alt="AI and technology working together"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div variants={cardVariants}>
                <motion.div
                  className="inline-flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 backdrop-blur-sm border border-cyan-100/60 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-semibold text-cyan-800 tracking-wide">OUR TECHNOLOGY</span>
                </motion.div>

                <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                  Production patterns
                  <span className="text-indigo-600"> without the bloat</span>
                </h2>

                <p className="text-xl leading-8 text-gray-700 mb-6">
                  My Company is an opinionated open-source starter: migrations, RLS policies, Stripe webhooks, dashboard UI, and marketing pages included. Extend it with your domain features while keeping tenant isolation and billing intact.
                </p>

                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                >
                  {[
                    {
                      title: "Stripe Billing",
                      description: "Stripe Checkout, subscription webhooks, and a manage-subscription dashboard wired to your Postgres schema."
                    },
                    {
                      title: "Supabase Auth and RLS",
                      description: "SSR auth helpers, tenant-scoped tables, and row-level security policies for organization data."
                    },
                    {
                      title: "Vercel-ready Routing",
                      description: "App Router pages, proxy-based auth, subdomain routing, and optional custom-domain management."
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start group"
                      variants={cardVariants}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="flex-shrink-0 w-8 h-8 mr-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mt-1"
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">{item.title}</span>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* CTA Section */}
        <Section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 overflow-hidden">
          <motion.div
            className="max-w-4xl mx-auto text-center py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={cardVariants}>
              <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
                Ready to build your SaaS?
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Stop rebuilding auth and billing from scratch. <span className="font-semibold">Get started free</span> and launch your multitenant SaaS on a proven foundation.
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-xl font-bold text-indigo-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-50 transform hover:scale-105"
                >
                  Start Your SaaS
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </motion.svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white/30 text-white rounded-2xl hover:border-white hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  Talk to us
                </Link>
              </motion.div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm text-indigo-100">
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-white mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-semibold">Free to start</span>
                  <span>No commitments</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-white mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-semibold">Open-source starter</span>
                  <span>Extend as needed</span>
                </div>
                <div className="flex flex-col items-center md:col-span-1 col-span-2">
                  <svg className="w-6 h-6 text-white mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-semibold">Support included</span>
                  <span>Docs and examples</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.svg"
                  alt="My Company Logo"
                  width={32}
                  height={32}
                  className="mr-3"
                  style={{ width: 32, height: 32 }}
                />
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">My Company</div>
              </div>
              <p className="text-gray-300 text-sm">
                Open-source multitenant SaaS starter with auth, billing, teams, and tenant routing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/signup" className="text-gray-300 hover:text-white transition-colors">Get Started</Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors">Feature guide</Link>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Contact Us</h3>
              <a
                href="mailto:hello@mycompany.com"
                className="text-gray-300 hover:text-white transition-colors"
              >
                hello@mycompany.com
              </a>
            </motion.div>
          </div>

          <div className="border-t border-white/10 pt-8 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} My Company. All rights reserved.</p>
              <p className="mt-2 md:mt-0">Open-source SaaS starter for teams building with Next.js, Supabase, and Stripe.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 