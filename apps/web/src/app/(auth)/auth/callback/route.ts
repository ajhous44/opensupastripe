import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import {
  isLikelyFreshAuthUser,
  sendSignupWelcomeEmail,
  shouldSendOAuthSignupWelcome,
  SIGNUP_WELCOME_OAUTH_MAX_USER_AGE_MS,
} from '@/lib/email/signup-welcome'

function getSafeRedirectPath(searchParams: URLSearchParams) {
  const nextParam = searchParams.get('next')
  if (!nextParam) return '/dashboard'
  if (nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    return nextParam
  }
  return '/dashboard'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const redirectPath = getSafeRedirectPath(url.searchParams)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth', url.origin))
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (
      user?.email &&
      isLikelyFreshAuthUser(user.created_at, SIGNUP_WELCOME_OAUTH_MAX_USER_AGE_MS) &&
      shouldSendOAuthSignupWelcome(user)
    ) {
      const meta = user.user_metadata as Record<string, unknown> | undefined
      const displayName =
        typeof meta?.full_name === 'string'
          ? meta.full_name
          : typeof meta?.name === 'string'
            ? meta.name
            : null
      await sendSignupWelcomeEmail({ to: user.email, displayName })
    }
  }

  return NextResponse.redirect(new URL(redirectPath, url.origin))
}
