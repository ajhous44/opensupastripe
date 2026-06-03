const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIn0.placeholder'

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

/** True when both public Supabase env vars are set (non-empty). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

/** URL/key for Supabase clients — placeholders during `next build` when env is unset. */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (url && anonKey) {
    return { url, anonKey }
  }

  if (isBuildPhase()) {
    return { url: BUILD_PLACEHOLDER_URL, anonKey: BUILD_PLACEHOLDER_ANON_KEY }
  }

  return null
}
