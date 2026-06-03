import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata = {
  title: 'Privacy Policy',
  description: 'My Company Privacy Policy',
}

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose prose-indigo mt-10 max-w-none">
            <h2>Introduction</h2>
            <p>
              My Company (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a software-as-a-service platform.
              This Privacy Policy describes how we collect, use, and protect information when you use our website and services.
            </p>

            <h2>Information We Collect</h2>
            <p>We may collect:</p>
            <ul>
              <li>Account information such as name, email address, and organization details</li>
              <li>Usage data including pages visited, device type, and browser information</li>
              <li>Billing information processed by our payment provider (Stripe)</li>
            </ul>

            <h2>How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide, operate, and maintain the platform</li>
              <li>Process subscriptions and billing</li>
              <li>Send service-related communications</li>
              <li>Improve security, reliability, and product experience</li>
            </ul>

            <h2>Tenant Websites</h2>
            <p>
              Customers may host branded experiences on subdomains or custom domains. Content on those tenant sites is provided by the customer.
              My Company provides infrastructure only and is not responsible for tenant-provided content.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We use trusted providers to operate the platform, including Supabase (database and authentication), Stripe (payments),
              and Vercel (hosting). These providers process data on our behalf under contractual obligations.
            </p>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies for authentication, preferences, and analytics. You can manage cookies in your browser settings.
            </p>

            <h2>Data Retention</h2>
            <p>
              We retain personal data for as long as needed to provide services and comply with legal obligations. You may request deletion by contacting us.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about this policy:{' '}
              <a href="mailto:privacy@mycompany.com">privacy@mycompany.com</a> or our{' '}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
