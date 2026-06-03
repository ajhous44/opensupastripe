'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FEATURE_PAGES, FEATURE_SLUGS } from '@/lib/marketing/platform-feature-pages'

const linkClass =
  'text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <motion.div
            className="sm:col-span-2 lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center">
              <Image src="/logo.svg" alt="My Company Logo" width={32} height={32} className="mr-3" />
              <div className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-xl font-bold text-transparent">
                My Company
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Launch your organization website in 60 seconds. No coding required.
            </p>
          </motion.div>

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            <FooterSection title="Product">
              <li>
                <Link href="/auth/signup" className={linkClass}>
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/features" className={linkClass}>
                  Feature guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact us
                </Link>
              </li>
            </FooterSection>
          </motion.div>

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <FooterSection title="Platform">
              <li>
                <Link href="/integrations" className={linkClass}>
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/features" className={linkClass}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={linkClass}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className={linkClass}>
                  Demo
                </Link>
              </li>
            </FooterSection>
          </motion.div>

          <motion.div className="sm:col-span-2 lg:col-span-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <FooterSection title="Company">
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className={linkClass}>
                  Get started
                </Link>
              </li>
            </FooterSection>
          </motion.div>

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}>
            <FooterSection title="Legal & contact">
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className={linkClass}>
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact us
                </Link>
              </li>
              <li>
                <a href="mailto:hello@mycompany.com" className={linkClass}>
                  hello@mycompany.com
                </a>
              </li>
            </FooterSection>
          </motion.div>

          <motion.div
            className="sm:col-span-2 lg:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Features
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              <li>
                <Link href="/features" className={linkClass}>
                  All features
                </Link>
              </li>
              {FEATURE_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link href={`/features/${slug}`} className={linkClass}>
                    {FEATURE_PAGES[slug].navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 border-t border-gray-200 pt-8 dark:border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-300" suppressHydrationWarning>&copy; {new Date().getFullYear()} My Company. All rights reserved.</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Open-source SaaS starter for teams building with Next.js, Supabase, and Stripe.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
