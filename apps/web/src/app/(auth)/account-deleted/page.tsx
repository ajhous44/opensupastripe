'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/logo.svg" 
              alt="My Company Logo" 
              width={48} 
              height={48}
              className="mr-3" 
            />
            <span className="text-2xl font-bold text-gray-900">My Company</span>
          </div>
          
          <div className="rounded-full bg-green-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Account Successfully Deleted
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account and all associated data have been permanently deleted from our system.
          </p>

          <div className="mt-8">
            <Link 
              href="/"
              className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Homepage
            </Link>
          </div>
          
          <p className="mt-4 text-center text-xs text-gray-500">
            If you wish to provide feedback on why you left, please email us at{' '}
            <a href="mailto:hello@mycompany.com" className="text-blue-600 hover:text-blue-500">
              hello@mycompany.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 