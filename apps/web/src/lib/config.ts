import 'server-only'

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  API_TIMEOUT: 30000,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,

  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  MAX_REQUESTS_PER_MINUTE: 60,
  CSRF_TOKEN_EXPIRY: 60 * 60,
  TENANT_CACHE_TTL_MS: 5 * 60 * 1000,

  DEFAULT_PRIMARY_COLOR: '#4F46E5',
  DEFAULT_SECONDARY_COLOR: '#60A5FA',
  DEFAULT_ACCENT_COLOR: '#EF4444',
} as const

export function validateConfig() {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
  const missing = requiredVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export const supabaseConfig = {
  url: config.SUPABASE_URL,
  anonKey: config.SUPABASE_ANON_KEY,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
}

export const securityConfig = {
  rateLimitWindow: config.RATE_LIMIT_WINDOW_MS,
  maxRequestsPerMinute: config.MAX_REQUESTS_PER_MINUTE,
  csrfTokenExpiry: config.CSRF_TOKEN_EXPIRY,
}

export default config
