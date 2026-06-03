import type { Metadata } from 'next'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact My Company.',
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-gray-900">Contact us</h1>
          <p className="mt-4 text-gray-600">
            Have a question about the starter? Send us a message and we&apos;ll get back to you.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Or email us directly at{' '}
            <a href="mailto:hello@mycompany.com" className="text-indigo-600">hello@mycompany.com</a>
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
