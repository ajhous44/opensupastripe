'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { signup } from '@/app/actions/auth'
import GoogleOneTap from '@/components/GoogleOneTap'
import { FcGoogle } from 'react-icons/fc'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
// const router = useRouter()

  const domain = typeof window !== 'undefined' ? window.location.origin : ''

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setShowConfirmation(false)

    // Validate terms acceptance
    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy')
      setLoading(false)
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      // Create the user account
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const result = await signup(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Instead of redirecting, show the confirmation message
      setShowConfirmation(true)
    } catch (error: unknown) {
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          setErrorMessage('Invalid email address or already in use')
        } else if (error.message.includes('password')) {
          setErrorMessage('Password is too weak. Use at least 8 characters with numbers and symbols')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center justify-center">
          <Image 
            src="/logo.svg" 
            alt="My Company Logo" 
            width={40} 
            height={40}
            className="mr-2" 
          />
          <span className="text-xl font-bold text-gray-900">My Company</span>
        </div>
      </div>
      
      {showConfirmation ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Check your email
          </h2>
          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <p className="text-center text-sm text-blue-700">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>.
              <br />Please click the link in the email to activate your account.
            </p>
          </div>
          <p className="mt-8 text-sm text-gray-600">
            Once confirmed, you can{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in
            </Link>
            {' '}to your account.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 text-center">
              Create your account
            </h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-4">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      // Show confirm password field when user starts typing password
                      if (e.target.value && !showConfirmPasswordField) {
                        setShowConfirmPasswordField(true)
                      }
                    }}
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>
              
              {showConfirmPasswordField && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                          <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must match your password exactly
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="rounded-md bg-red-50 p-3 text-center">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 border border-gray-300 rounded bg-white/70 focus:ring-2 focus:ring-blue-500 text-blue-600"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  By signing up, you agree to our{' '}
                  <Link href={`${domain}/terms`} className="font-medium text-blue-600 hover:underline" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={`${domain}/policy`} className="font-medium text-blue-600 hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 px-2 text-gray-500">Or sign up with</span>
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
                if (error) {
                  setErrorMessage(`Google Sign-Up Error: ${error.message}`);
                  setLoading(false);
                }
                // No need to setLoading(false) on success, as the page will redirect
              }}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              <FcGoogle className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
              Sign up with Google
            </button>
          </div>
          
          <GoogleOneTap />
        </>
      )}
    </div>
  )
} 
