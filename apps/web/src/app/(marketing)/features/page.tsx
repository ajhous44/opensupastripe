import type { Metadata } from 'next'
import Image from 'next/image'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Platform features for modern SaaS teams.',
}

const FEATURES = [
  {
    title: 'Multitenant routing',
    description: 'Subdomain and custom domain support with middleware-based tenant detection and RLS isolation.',
  },
  {
    title: 'Authentication',
    description: 'Supabase Auth with SSR cookie patterns, team invites, and role-based access control.',
  },
  {
    title: 'Stripe billing',
    description: 'Checkout sessions, webhooks, subscription lifecycle, and customer billing portal.',
  },
  {
    title: 'Team management',
    description: 'Invite teammates, assign admin or staff roles, and manage workspace membership.',
  },
  {
    title: 'Dashboard shell',
    description: 'Authenticated dashboard layout ready for your product-specific modules and workflows.',
  },
  {
    title: 'Vercel deployment',
    description: 'Optimized for Vercel with environment-based configuration and production-ready defaults.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-gray-900">Platform features</h1>
            <p className="mt-4 text-lg text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. A complete foundation for shipping multitenant SaaS products.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <Image
              src="/placeholder.svg"
              alt="Platform overview"
              width={1200}
              height={630}
              className="w-full rounded-2xl border border-gray-200"
            />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
