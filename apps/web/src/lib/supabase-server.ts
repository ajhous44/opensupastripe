import { createServerClient, type SetAllCookies } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublicConfig } from '@/lib/supabase-config'

export async function createClient() {
  const config = getSupabasePublicConfig()
  if (!config) {
    throw new Error('Supabase is not configured')
  }

  const cookieStore = await cookies()

  return createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}