import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Demo',
  description: 'See the platform in action.',
}

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold text-gray-900">Platform demo</h1>
          <p className="mt-4 text-lg text-gray-600">
            Lorem ipsum dolor sit amet. Sign up for a free account to explore the dashboard, or visit a sample tenant subdomain.
          </p>
          <Image
            src="/placeholder.svg"
            alt="Demo screenshot"
            width={1200}
            height={630}
            className="mx-auto mt-12 rounded-2xl border border-gray-200"
          />
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Start free trial
            </Link>
            <Link href="/pricing" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              View pricing
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
