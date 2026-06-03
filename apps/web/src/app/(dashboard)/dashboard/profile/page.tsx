'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Alert from '@/components/Alert'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import { deleteUserAccount } from './actions'
import { createPhoneNumberHandler } from '@/lib/formatters'

import { getByUserId, update } from '@/app/actions/profiles'

import type { Profile } from '@/types'

type ProfileEditorProps = {
  initialProfile: Profile
  fallbackEmail: string
}

function ProfileEditor({ initialProfile, fallbackEmail }: ProfileEditorProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [email, setEmail] = useState(initialProfile.email || fallbackEmail)
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteInProgress, setDeleteInProgress] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage(null)

      const updateResult = await update(profile.id, {
        full_name: fullName,
        email,
        phone,
      })

      if (updateResult.error) {
        console.error('Profile update error:', updateResult.error)
        setMessage({ type: 'error', text: 'Failed to update profile' })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        if (updateResult.data) {
          setProfile(updateResult.data)
        }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleteInProgress(true)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const result = await deleteUserAccount(user.id)

      if (!result.success) {
        if (result.needsManualIntervention) {
          await supabase.auth.signOut()
          window.location.href = '/account-deletion-error'
          return
        }

        throw new Error(result.error || 'Failed to delete account')
      }

      await supabase.auth.signOut()
      window.location.href = '/account-deleted'
    } catch (error) {
      console.error('Delete account error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const isUnauthorized = errorMessage.includes('Unauthorized')

      setMessage({
        type: 'error',
        text: isUnauthorized
          ? 'You can only delete your own account.'
          : 'Failed to delete account. Please contact support at hello@mycompany.com for assistance.',
      })

      setIsDeleteDialogOpen(false)
      setDeleteInProgress(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Your Profile</h1>

        {message ? (
          <Alert
            type={message.type}
            message={message.text}
            className="mb-4"
          />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={16}
                value={phone}
                onChange={createPhoneNumberHandler(setPhone)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="e.g. (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-red-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteInProgress}
            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer ${deleteInProgress ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {deleteInProgress ? 'Deleting Account...' : 'Delete Account'}
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Account"
        message="This will permanently delete your organization data, remove uploaded images and files from storage, cancel active subscriptions and stop future billing, and delete your user account (you will be signed out). This action cannot be reversed."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmButtonStyle="bg-red-600 hover:bg-red-700"
        requireConfirmText="confirm"
      />
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()

  const { data: profileResult, isLoading } = useSWR('profile', async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { user: null, profile: null, error: null }
    }

    const profileResponse = await getByUserId(user.id)
    return { user, profile: profileResponse.data, error: profileResponse.error }
  })

  useEffect(() => {
    if (!isLoading && profileResult?.user === null) {
      router.push('/auth/login')
    }
  }, [isLoading, profileResult?.user, router])

  if (isLoading || !profileResult?.user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <div className="animate-pulse h-8 w-48 bg-gray-300 rounded mb-6 mx-auto"></div>
          <div className="space-y-4">
            <div className="animate-pulse h-10 bg-gray-300 rounded"></div>
            <div className="animate-pulse h-10 bg-gray-300 rounded"></div>
            <div className="animate-pulse h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (profileResult.error || !profileResult.profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
        <Alert type="error" message="Failed to load profile" />
      </div>
    )
  }

  return (
    <ProfileEditor
      key={profileResult.profile.id}
      initialProfile={profileResult.profile}
      fallbackEmail={profileResult.user.email ?? ''}
    />
  )
}
