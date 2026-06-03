'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { login } from '@/app/actions/auth'
import GoogleOneTap from '@/components/GoogleOneTap'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const result = await login(formData)

    if (!result.success) {
      setErrorMessage(result.error ?? 'Login failed')
      setLoading(false)
      return
    }

    // Simply redirect to dashboard - it will handle organization status appropriately
    router.push('/dashboard')
    router.refresh()
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
          Sign in to your account
        </h2>
      </div>
      
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-5">
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
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white/70 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-3 text-center">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white/80 px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <div>
        <button
          type="button"
          onClick={async () => {
            setLoading(true); // Indicate loading
            setErrorMessage(null);
            const supabase = createClient();
            const redirectUrl = new URL('/auth/callback', window.location.origin)
            redirectUrl.searchParams.set('next', '/dashboard')

            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: redirectUrl.toString()
              }
            });

            console.log(`Auth redirect URL: ${redirectUrl.toString()} (NODE_ENV: ${process.env.NODE_ENV})`);
            
            if (error) {
              setErrorMessage(`Google Sign-In Error: ${error.message}`);
              setLoading(false);
            }
            // No need to setLoading(false) on success, as the page will redirect
          }}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
        >
          <FcGoogle className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Sign in with Google
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
      <GoogleOneTap />
    </div>
  )
} 
