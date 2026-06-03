import { headers } from 'next/headers'
import { normalizeDomain } from '@/lib/auth-helpers'

/**
 * Get a header safely from Next.js headers() 
 * This abstracts away the TypeScript issues with the headers() API
 */
export async function getHeaderValue(name: string): Promise<string> {
  const headersList = await headers()
  return headersList.get(name) || ''
}

/**
 * Get the organization identifier from the request headers
 * This can be either a subdomain or a custom domain
 */
export async function getSubdomain(): Promise<string> {
  // First try to get the subdomain header
  const subdomain = await getHeaderValue('x-subdomain')
  if (subdomain) {
    return subdomain
  }
  
  // If no subdomain header, check for custom domain
  const customDomain = await getHeaderValue('x-custom-domain')
  if (customDomain) {
    return `domain:${customDomain}`
  }
  
  // Fallback: derive from Host when middleware headers are absent (e.g., for manifest route)
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const hostname = normalizeDomain(host)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isPlatformHost = hostname.endsWith('localhost:3000') || hostname.endsWith('vercel.app') || isLocalhost
  const hasDomainStructure = hostname.includes('.') && !hostname.startsWith('localhost')
  
  if (!isPlatformHost && hasDomainStructure) {
    return `domain:${hostname}`
  }
  
  if (isPlatformHost && hasDomainStructure) {
    const [firstPart] = hostname.split('.')
    const systemSubdomains = ['www', 'app', 'localhost', 'opensupastripe-web', 'opensupastripe']
    if (firstPart && !systemSubdomains.includes(firstPart)) {
      return firstPart
    }
  }
  
  return ''
} 