'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard where the form is integrated
    router.push('/dashboard')
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
} 