import type { Metadata } from 'next'
import Image from 'next/image'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Tenant Site',
}

export default async function TenantSitePage() {
  const headersList = await headers()
  const subdomain = headersList.get('x-subdomain') ?? 'tenant'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Image src="/logo.svg" alt="Logo" width={48} height={48} />
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{subdomain}.yourdomain.com</h1>
      <p className="mt-4 max-w-md text-center text-gray-600">
        This is a placeholder tenant site. Replace this route group with your product&apos;s customer-facing experience.
      </p>
    </div>
  )
}
