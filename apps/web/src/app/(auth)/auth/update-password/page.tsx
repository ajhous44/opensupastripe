'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is authenticated with a passwordUpdate session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Invalid or expired password reset link. Please try again.')
      } else {
        setInitialized(true)
      }
    }
    
    checkSession()
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMessage('Password updated successfully')
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }

  if (!initialized) {
    return (
      <div className="w-full rounded-xl bg-white/80 p-10 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-pulse flex space-x-4 mb-8">
            <div className="rounded-full bg-slate-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Validating your reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl bg-white/80 p-10 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="flex items-center justify-center">
          <Image 
            src="/logo.svg" 
            alt="My Company Logo" 
            width={48} 
            height={48}
            className="mr-3" 
          />
          <span className="text-2xl font-bold text-gray-900">My Company</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 text-center">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter and confirm your new password below
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleUpdatePassword}>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white/70 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white/70 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-3 text-center">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
} 