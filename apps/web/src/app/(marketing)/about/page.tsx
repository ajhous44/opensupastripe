import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'About',
  description: 'About My Company — a multitenant SaaS starter.',
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-gray-900">About My Company</h1>
          <p className="mt-6 text-lg text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. We built this starter so teams can ship
            multitenant SaaS products faster with proven patterns for auth, billing, and tenant isolation.
          </p>
          <p className="mt-4 text-gray-600">
            The stack combines Next.js, Supabase, Stripe, and Vercel — the same production patterns used by modern SaaS teams,
            without domain-specific business logic baked in.
          </p>

          <Image
            src="/placeholder.svg"
            alt="Team placeholder"
            width={1200}
            height={630}
            className="mt-12 w-full rounded-2xl border border-gray-200"
          />

          <div className="mt-12 text-center">
            <Link
              href="/auth/signup"
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
