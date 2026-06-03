'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AccountDeletionErrorPage() {
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
          
          <div className="rounded-full bg-red-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Account Deletion Error
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-600">
            This is awkward... We encountered an issue while trying to delete your account. Your account may be partially deleted.
          </p>

          <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-700">
              Please contact our support team at{' '}
              <a href="mailto:hello@mycompany.com" className="font-medium text-yellow-700 underline">
                hello@mycompany.com
              </a>
              {' '}for assistance in completing the account deletion process. Sorry for the inconvenience!
            </p>
          </div>

          <div className="mt-8">
            <Link 
              href="/"
              className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 