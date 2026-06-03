import type { Metadata } from 'next'
import { CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import CheckoutButton from '@/components/CheckoutButton'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple pricing for teams of all sizes.',
}

const tiers = [
  {
    name: 'Starter',
    href: '/auth/signup?plan=starter',
    priceMonthly: '$0',
    description: 'Everything you need to evaluate and launch.',
    features: [
      '1 workspace',
      'Subdomain hosting',
      'Team invites',
      'Basic support',
    ],
    mostPopular: false,
    cta: 'Get started free',
    isPro: false,
  },
  {
    name: 'Pro',
    href: '/api/checkout',
    priceMonthly: '$29',
    description: 'For teams ready to scale with custom domains and priority support.',
    features: [
      'Custom domain',
      'Priority support',
      'Advanced analytics',
      'Higher usage limits',
      'Everything in Starter',
    ],
    mostPopular: true,
    cta: 'Start free trial',
    isPro: true,
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your team. Upgrade or cancel anytime.</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-8 ${
                  tier.mostPopular ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-200'
                }`}
              >
                {tier.mostPopular ? (
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Most popular
                  </span>
                ) : null}
                <h2 className="mt-4 text-2xl font-bold text-gray-900">{tier.name}</h2>
                <p className="mt-2 text-gray-600">{tier.description}</p>
                <p className="mt-6 text-4xl font-bold text-gray-900">
                  {tier.priceMonthly}
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </p>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckIcon className="h-5 w-5 shrink-0 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {tier.isPro ? (
                    <CheckoutButton className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                      {tier.cta}
                    </CheckoutButton>
                  ) : (
                    <Link
                      href={tier.href}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      {tier.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
