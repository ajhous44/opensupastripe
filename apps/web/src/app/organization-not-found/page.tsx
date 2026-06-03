import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Organization Not Found',
}

export default function OrganizationNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-gray-900">Organization not found</h1>
      <p className="mt-4 text-gray-600">This subdomain is not registered on the platform.</p>
      <Link href="/" className="mt-8 text-indigo-600 hover:text-indigo-700">
        Go to homepage →
      </Link>
    </div>
  )
}
