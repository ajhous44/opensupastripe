import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata = {
  title: 'Terms of Service',
  description: 'My Company Terms of Service',
}

const LAST_UPDATED = 'June 2, 2026'

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-grow">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="prose prose-indigo mt-10 max-w-none">
            <h2>1. Agreement</h2>
            <p>
              By accessing or using My Company&apos;s platform, you agree to these Terms. If you do not agree, do not use the services.
            </p>

            <h2>2. Service Description</h2>
            <p>
              My Company provides a multitenant SaaS platform for creating and managing customer workspaces, team access, and subscriptions.
            </p>

            <h2>3. Accounts</h2>
            <p>
              You are responsible for maintaining accurate account information and safeguarding credentials. You are responsible for activity under your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to misuse the platform, interfere with service operation, or upload unlawful content.</p>

            <h2>5. Subscriptions and Billing</h2>
            <p>
              Paid plans are billed through Stripe. Subscriptions renew automatically until canceled. Fees are non-refundable except where required by law.
              You authorize recurring charges for applicable taxes and subscription fees.
            </p>

            <h2>6. Tenant Content</h2>
            <p>
              You retain ownership of content you upload. You grant My Company a limited license to host and display that content solely to operate your workspace.
            </p>

            <h2>7. Termination</h2>
            <p>
              You may cancel at any time. We may suspend or terminate access for violations of these Terms or legal requirements.
            </p>

            <h2>8. Disclaimer</h2>
            <p>
              The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, to the maximum extent permitted by law.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, My Company is not liable for indirect, incidental, or consequential damages.
              Total liability is limited to fees paid in the twelve months before the claim.
            </p>

            <h2>10. Privacy</h2>
            <p>
              Our data practices are described in the{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            <h2>11. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use after updates constitutes acceptance.
            </p>

            <h2>12. Contact</h2>
            <p>
              Questions: <a href="mailto:hello@mycompany.com">hello@mycompany.com</a> or our{' '}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
