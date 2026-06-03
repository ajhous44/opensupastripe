'use client'

import { useState } from 'react'
import { acceptInvite } from '@/app/actions/team'
import { logger } from '@/lib/logger'

interface AcceptInviteClientProps {
  token: string
  organizationName: string
  role: 'admin' | 'staff'
}

export default function AcceptInviteClient({ token, organizationName, role }: AcceptInviteClientProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setLoading(true)
    setError(null)

    try {
      logger.info('Attempting to accept team invite')
      const result = await acceptInvite({ token })

      logger.debug('Accept invite result:', result)

      if (result.error) {
        logger.error('Accept invite error:', result.error)
        setError(result.error.message)
        setLoading(false)
      } else {
        logger.info('Invite accepted successfully, redirecting...')
        setSuccess(true)
        // Small delay to show success message and ensure server-side data is ready
        setTimeout(() => {
          // Use hard navigation to ensure fresh data load
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (err) {
      logger.error('Error accepting invite:', err)
      setError('Failed to accept invite. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {organizationName}!</h1>
          <p className="text-gray-600 mb-4">
            You've joined as a <strong>{role}</strong>. Redirecting to dashboard...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Invitation</h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join <strong>{organizationName}</strong> as a <strong>{role}</strong>.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Accepting...' : 'Accept Invitation'}
          </button>
          <a
            href="/dashboard"
            className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Decline
          </a>
        </div>
      </div>
    </div>
  )
}

