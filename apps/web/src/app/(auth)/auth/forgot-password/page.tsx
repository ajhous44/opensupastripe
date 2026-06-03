'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset instructions sent to your email')
    }
    
    setLoading(false)
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white/70 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Sending...' : 'Send reset instructions'}
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