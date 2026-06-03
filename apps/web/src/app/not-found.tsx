import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 text-indigo-600 hover:text-indigo-700">
        Back to home →
      </Link>
    </div>
  )
}
