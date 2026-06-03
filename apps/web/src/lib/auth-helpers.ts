import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * Authentication helper for API routes
 * Returns the authenticated user or an error response
 */
export async function requireAuth(_request?: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Helper to extract and validate required parameters from request
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]) {
  const missing = required.filter(param => !params[param])
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: `Missing required parameters: ${missing.join(', ')}` },
        { status: 400 }
      )
    }
  }

  return { valid: true, error: null }
}

/**
 * Normalize a domain string for storage/lookup
 * - trims whitespace
 * - lowercases
 * - strips protocol and port
 * - strips leading www.
 * - strips trailing dot
 */
export function normalizeDomain(input: string): string {
  let domain = (input || '').trim().toLowerCase()
  // strip protocol
  domain = domain.replace(/^https?:\/\//, '')
  // strip path/query if accidentally included
  ;[domain] = domain.split('/')
  // strip port
  if (domain.includes(':')) {
    ;[domain] = domain.split(':')
  }
  // strip leading www.
  if (domain.startsWith('www.')) {
    domain = domain.slice(4)
  }
  // strip trailing dot
  if (domain.endsWith('.')) {
    domain = domain.slice(0, -1)
  }
  return domain
}

/**
 * Helper to validate domain format
 */
export function validateDomainFormat(domain: string) {
  const normalized = normalizeDomain(domain)
  const domainRegex = /^(?!-)(?:[a-z0-9-]{0,62}[a-z0-9]\.)+[a-z]{2,}$/

  // Explicitly reject common non-apex user input variants
  if (domain.trim().toLowerCase().startsWith('www.')) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Enter your apex domain (e.g., example.com), not www.example.com' },
        { status: 400 }
      )
    }
  }

  if (!domainRegex.test(normalized)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }
  }

  return { valid: true, error: null }
} 