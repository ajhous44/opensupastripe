'use client'
import Script from 'next/script'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'

// Define types for Google Sign-In objects
interface CredentialResponse {
  credential: string
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  getNotDisplayedReason: () => string
  getSkippedReason: () => string
  getDismissedReason: () => string
}

type GoogleOneTapProps = {
  onError?: (message: string) => void
}

export default function GoogleOneTap({ onError }: GoogleOneTapProps) {
  const router = useRouter()
  const [isGsiScriptLoaded, setIsGsiScriptLoaded] = useState(false)
  const didToastUnavailableRef = useRef(false)
  const didToastAuthErrorRef = useRef(false)

  useEffect(() => {
    const initGoogleOneTap = async () => {
      if (!isGsiScriptLoaded) {
        // Minimal log in dev, silent in prod
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Dev] GSI script not loaded yet, waiting...')
        }
        return
      }

      try {
        // Initialize Supabase client
        const supabase = createClient()

        // Skip if already logged in
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          // Silent in prod, debug log in dev
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Dev] User already logged in, skipping Google One Tap.')
          }
          return
        }

        const reportError = (message: string) => {
          if (onError) {
            onError(message)
            return
          }
          toast({
            title: 'Google sign-in unavailable',
            description: message,
            variant: 'destructive',
          })
        }

        // Check if google object is available
        // @ts-expect-error Property 'google' does not exist on type 'Window & typeof globalThis'
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
          console.error('[Error] Google Identity Services structure not available.')
          if (!didToastUnavailableRef.current) {
            didToastUnavailableRef.current = true
            reportError('Google sign-in is currently unavailable in this browser. You can still sign in with email and password.')
          }
          return
        }

        // Verify Client ID
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
          // Missing Client ID is expected if Google OAuth isn't configured locally.
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Dev] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google One Tap disabled.')
          } else if (!didToastUnavailableRef.current) {
            didToastUnavailableRef.current = true
            reportError('Google sign-in is not configured. Please use email/password or try again later.')
          }
          return // Stop initialization if ID is missing
        }
        // Dev-only logs for Client ID and Origin
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Dev] Using Google Client ID:', clientId)
          console.debug('[Dev] Current Origin:', window.location.origin)
        }

        // Generate nonce
        const rawNonce = crypto.randomUUID()
        const encoder = new TextEncoder()
        const hashedBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawNonce))
        const hashedNonce = Array.from(new Uint8Array(hashedBuffer))
          .map(b => b.toString(16).padStart(2, '0')).join('')

        // Initialize Google Identity Services
        // @ts-expect-error Property 'google' does not exist on type 'Window & typeof globalThis'
        google.accounts.id.initialize({
          client_id: clientId, // Use the verified variable
          callback: async (res: CredentialResponse) => { // Use defined type
            // Dev-only log for callback received
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Dev] Google One Tap callback received:', res)
            }
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: res.credential,
              nonce: rawNonce, // Use the raw nonce here for verification
            })
            if (error) {
              console.error('[Error] Error signing in with Google One Tap:', error.message)
              if (!didToastAuthErrorRef.current) {
                didToastAuthErrorRef.current = true
                const description =
                  process.env.NODE_ENV === 'development'
                    ? `Google sign-in failed: ${error.message}`
                    : 'Google sign-in failed. Please try again, or use email and password.'
                if (onError) {
                  onError(description)
                } else {
                  toast({
                    title: 'Google sign-in failed',
                    description,
                    variant: 'destructive',
                  })
                }
              }
            } else {
              // Silent in prod, debug log in dev
              if (process.env.NODE_ENV === 'development') {
                console.debug('[Dev] Successfully signed in with Google One Tap.')
              }
              router.push('/dashboard') // Redirect to dashboard on success
              router.refresh() // Refresh router state
            }
          },
          nonce: hashedNonce, // Pass the hashed nonce to Google
          use_fedcm_for_prompt: true, // Recommended for better UX
        })

        // Prompt the user for One Tap sign-in
        // @ts-expect-error Property 'google' does not exist on type 'Window & typeof globalThis'
        google.accounts.id.prompt((notification: PromptMomentNotification) => { // Use defined type
          // Log prompt status only if it wasn't displayed or was dismissed/skipped
          if (notification.isNotDisplayed()) {
            // Use warn level for non-displayed/skipped prompts
            console.warn(`[Warn] One Tap prompt not displayed: ${notification.getNotDisplayedReason()}`)
          } else if (notification.isSkippedMoment()) {
            console.warn(`[Warn] One Tap prompt skipped: ${notification.getSkippedReason()}`)
          } else if (notification.getDismissedReason()) {
            console.warn(`[Warn] One Tap prompt dismissed: ${notification.getDismissedReason()}`)
          } else {
            // Dev-only log for successful prompt display (usually not needed)
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Dev] Google One Tap prompt displayed successfully.')
            }
          }
        })
      } catch (error) {
        // Catch errors during initialization or prompt phase
        console.error('[Error] Failed to initialize or prompt Google One Tap:', error)
        if (!didToastUnavailableRef.current) {
          didToastUnavailableRef.current = true
          const message =
            process.env.NODE_ENV === 'development'
              ? `Google One Tap failed to initialize: ${(error as Error).message ?? String(error)}`
              : 'Google sign-in is temporarily unavailable. You can still sign in with email and password.'
          if (onError) {
            onError(message)
          } else {
            toast({
              title: 'Google sign-in unavailable',
              description: message,
              variant: 'destructive',
            })
          }
        }
      }
    }

    initGoogleOneTap()

  }, [isGsiScriptLoaded, router, onError])

  // Add the GSI client script.
  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      async
      strategy="lazyOnload" // Use lazyOnload strategy
      onLoad={() => {
        // Dev-only log for script load
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Dev] Google GSI script loaded.')
        }
        setIsGsiScriptLoaded(true) // Set flag when script is loaded
      }}
      onError={(e) => {
        console.error('[Error] Error loading Google GSI script:', e)
        if (!didToastUnavailableRef.current) {
          didToastUnavailableRef.current = true
          const message =
            process.env.NODE_ENV === 'development'
              ? 'Failed to load Google sign-in resources (check network / blockers).'
              : 'Google sign-in is unavailable right now. You can still sign in with email and password.'
          if (onError) {
            onError(message)
          } else {
            toast({
              title: 'Google sign-in unavailable',
              description: message,
              variant: 'destructive',
            })
          }
        }
      }}
    />
  )
}
