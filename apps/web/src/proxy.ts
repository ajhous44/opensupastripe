import { createServerClient as createOriginalServerClient, type SetAllCookies } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'
import { normalizeDomain } from '@/lib/auth-helpers'
import { isSupabaseConfigured } from '@/lib/supabase-config'

type SupabaseServerClient = SupabaseClient<any, 'public', any>

// Simple in-memory cache for tenant lookups
interface TenantData {
  id: string;
  name: string;
}

// Sentinel value for negative cache entries
const NEGATIVE_CACHE_ENTRY: TenantData = {
  id: '__NOT_FOUND__',
  name: '__NOT_FOUND__'
};

// Cache TTL of 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
// Short TTL for negative cache entries to avoid sticky false negatives per edge region
const NEGATIVE_CACHE_TTL_MS = 30 * 1000;

// Create LRU cache for tenant lookups with a capacity of 100 entries
const tenantCache = new LRUCache<string, TenantData>({
  max: 100, // Maximum number of items to store in the cache
  ttl: CACHE_TTL_MS, // Time to Live for cache entries
  // Critical: do not extend TTL on get. This prevents negative entries from becoming sticky
  // in high-traffic regions where they would otherwise be perpetuated indefinitely.
  updateAgeOnGet: false,
});

// Simple rate limiting - store timestamps of requests by IP
const ipRequests: Record<string, number[]> = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60; // 60 requests per minute

// Check if an IP is a localhost/development IP
function isLocalhostIp(ip: string): boolean {
  const localhostIps = [
    '127.0.0.1',    // IPv4 localhost
    '::1',          // IPv6 localhost
    '::ffff:127.0.0.1', // IPv4-mapped IPv6 localhost
    'localhost',
    'unknown'       // Often indicates localhost in development
  ];
  
  return localhostIps.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
}

// Check if an IP is rate limited
function isRateLimited(ip: string): boolean {
  // Skip rate limiting for localhost/development IPs
  if (isLocalhostIp(ip)) {
    return false;
  }
  
  const now = Date.now();
  
  // Get existing requests or initialize empty array
  const requests = ipRequests[ip] || [];
  
  // Keep only requests within the window
  const recentRequests = requests.filter(time => time > now - RATE_LIMIT_WINDOW_MS);
  
  // Update the requests for this IP
  ipRequests[ip] = [...recentRequests, now];
  
  // Check if too many requests
  const isLimited = recentRequests.length >= MAX_REQUESTS_PER_MINUTE;
  
  if (isLimited) {
    // console.log(`Rate limit exceeded for IP: ${ip}, ${recentRequests.length} requests in the last minute`);
  }
  
  return isLimited;
}

// Enhanced function to get tenant using direct Supabase client (Edge Runtime compatible)
async function getTenant(
  supabase: SupabaseServerClient,
  subdomain: string,
  getAdminClient?: () => SupabaseServerClient
): Promise<TenantData | null> {
  // Check if we have a valid cache entry
  const cachedData = tenantCache.get(subdomain);
  if (cachedData) {
    // If we previously cached a negative result, drop it and perform a fresh lookup
    if (cachedData.id === '__NOT_FOUND__') {
      tenantCache.delete(subdomain);
    } else {
      return cachedData;
    }
  }
  
  // No valid cache entry, query directly
  // console.log('MIDDLEWARE: Cache miss for subdomain:', subdomain);
  
  try {
    // Enhanced logging for debugging

    
    // Set context for this specific query to ensure RLS works

    await supabase.rpc('set_config', {
      parameter: 'request.subdomain',
      value: subdomain
    });

    
    // Use .maybeSingle() instead of .single() to avoid errors when no rows found
    const { data: organization, error } = await supabase
      .from('organizations_public')
      .select('id, name')
      .eq('subdomain', subdomain)
      .maybeSingle();
    

    
    if (error) {
      console.error('MIDDLEWARE: Subdomain query error for', subdomain, ':', error);
      
      // If error suggests RLS context issue, cache a short-lived negative result
      if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        tenantCache.set(subdomain, NEGATIVE_CACHE_ENTRY, { ttl: NEGATIVE_CACHE_TTL_MS });
      }
      return null;
    }
    
    if (organization) {

      const tenantData: TenantData = {
        id: organization.id,
        name: organization.name || 'Unknown Organization'
      };
      
      // Store in cache

      tenantCache.set(subdomain, tenantData);
      return tenantData;
    }
    
    // Admin fallback to handle cases where session-scoped context was missed in edge
    if (getAdminClient) {
      try {
        const admin = getAdminClient();
        const { data: adminOrganization, error: adminError } = await admin
          .from('organizations_public')
          .select('id, name')
          .eq('subdomain', subdomain)
          .maybeSingle();
        if (adminError && process.env.NODE_ENV === 'development') {
          console.warn('MIDDLEWARE: Admin fallback subdomain query error:', adminError);
        }
        if (adminOrganization) {
          const tenantData: TenantData = {
            id: adminOrganization.id,
            name: adminOrganization.name || 'Unknown Organization'
          };
          tenantCache.set(subdomain, tenantData);
          return tenantData;
        }
      } catch (adminErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('MIDDLEWARE: Admin fallback failed for subdomain:', subdomain, adminErr);
        }
      }
    }
    
    // No organization found - cache negative result with a short TTL
    tenantCache.set(subdomain, NEGATIVE_CACHE_ENTRY, { ttl: NEGATIVE_CACHE_TTL_MS });
    return null;
  } catch (error) {
    console.error('MIDDLEWARE: Subdomain lookup failed for', subdomain, ':', error);
    return null;
  }
}

// Enhanced function to get tenant by custom domain using direct Supabase client
async function getTenantByCustomDomain(
  supabase: SupabaseServerClient,
  hostname: string,
  getAdminClient?: () => SupabaseServerClient
): Promise<TenantData | null> {
  const cacheKey = `custom:${hostname}`;
  
  // Check cache first
  const cachedData = tenantCache.get(cacheKey);
  if (cachedData) {
    // If we previously cached a negative result, drop it and perform a fresh lookup
    if (cachedData.id === '__NOT_FOUND__') {
      tenantCache.delete(cacheKey);
    } else {
      return cachedData;
    }
  }
  
  try {
    // Set context for this specific query to ensure RLS works
    await supabase.rpc('set_config', {
      parameter: 'request.custom_domain',
      value: hostname
    });
    
    // Use .maybeSingle() instead of .single() to avoid errors when no rows found
    const { data: organization, error } = await supabase
      .from('organizations_public')
      .select('id, name')
      .eq('custom_domain', hostname)
      .eq('custom_domain_verified', true)
      .maybeSingle();
    
    if (error) {
      // Only log unexpected errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('MIDDLEWARE: Custom domain query error:', error);
      }
      
      // If error suggests RLS context issue, cache a short-lived negative result
      // to prevent immediate retry but allow recovery
      if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        // Cache negative result with a short TTL only
        tenantCache.set(cacheKey, NEGATIVE_CACHE_ENTRY, { ttl: NEGATIVE_CACHE_TTL_MS });
      }
      return null;
    }
    
    if (organization) {
      const tenantData: TenantData = {
        id: organization.id,
        name: organization.name || 'Unknown Organization'
      };
      
      // Store in cache with full TTL
      tenantCache.set(cacheKey, tenantData);
      return tenantData;
    }
    
    // Admin fallback to handle cases where session-scoped context was missed in edge
    if (getAdminClient) {
      try {
        const admin = getAdminClient();
        const { data: adminOrganization, error: adminError } = await admin
          .from('organizations_public')
          .select('id, name')
          .eq('custom_domain', hostname)
          .eq('custom_domain_verified', true)
          .maybeSingle();
        if (adminError && process.env.NODE_ENV === 'development') {
          console.warn('MIDDLEWARE: Admin fallback custom domain query error:', adminError);
        }
        if (adminOrganization) {
          const tenantData: TenantData = {
            id: adminOrganization.id,
            name: adminOrganization.name || 'Unknown Organization'
          };
          tenantCache.set(`custom:${hostname}`, tenantData);
          return tenantData;
        }
      } catch (adminErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('MIDDLEWARE: Admin fallback failed for custom domain:', hostname, adminErr);
        }
      }
    }
    
    // No organization found - cache negative result with a short TTL to allow for DNS propagation
    tenantCache.set(cacheKey, NEGATIVE_CACHE_ENTRY, { ttl: NEGATIVE_CACHE_TTL_MS });
    return null;
  } catch (error) {
    // Only log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('MIDDLEWARE: Custom domain lookup failed:', error);
    }
    
    // For network/timeout errors, don't cache the failure
    // This allows immediate retry which might succeed
    return null;
  }
}

// Function to generate a CSP nonce using Web Crypto API (Edge compatible)
function generateNonce(): string {
  // Create random values using the Web Crypto API
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  
  // Convert to base64
  return btoa(String.fromCharCode(...random))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Function to build a strict Content Security Policy
function generateCsp(nonce: string): string {
  // Detect if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  // Base CSP directives
  const directives = [
    // Default to only allowing content from same origin
    `default-src 'self'`,
    
    // Script sources
    isDev 
      ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.googletagmanager.com https://*.google-analytics.com https://plausible.io https://accounts.google.com` 
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' blob: https://www.googletagmanager.com https://*.google-analytics.com https://plausible.io https://accounts.google.com`,
    
    // Worker sources for WASM-based tools
    `worker-src 'self' blob:`,
    
    // Style sources - Allow unsafe-inline and style attributes for dev tooling and dynamic styles
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com`,
    
    // Allow inline style attributes for dynamic styling
    `style-src-attr 'unsafe-inline'`,
    
    // For images, allow self, data URLs, and trusted image sources
    isDev
      ? `img-src 'self' blob: data: http://127.0.0.1:54321 http://localhost:54321 https://*.googleapis.com https://*.googleusercontent.com https://*.supabase.co https://*.supabase.in https://*.google.com https://developers.google.com https://maps.google.com https://*.gstatic.com`
      : `img-src 'self' blob: data: https://*.googleapis.com https://*.googleusercontent.com https://*.supabase.co https://*.supabase.in https://*.google.com https://developers.google.com https://maps.google.com https://*.gstatic.com`,
    
    // Fonts: self and Google Fonts
    `font-src 'self' https://fonts.gstatic.com data:`,
    
    // For connections - allow analytics and third-party APIs used by the starter
    isDev
      ? `connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co http://127.0.0.1:54321 http://localhost:54321 http://localhost:3000 https://*.google-analytics.com https://photon.komoot.io https://plausible.io https://*.google.com https://accounts.google.com https://maps.google.com https://*.gstatic.com ws: http://localhost:*`
      : `connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://photon.komoot.io https://plausible.io https://*.google.com https://accounts.google.com https://maps.google.com https://*.gstatic.com`,
    
    // For media, only allow from same origin
    `media-src 'self'`,
    
    // Restrict object sources
    `object-src 'none'`,
    
    // For frames, allow Google sign-in and Maps if you enable them
    `frame-src 'self' https://*.google.com https://maps.google.com https://*.gstatic.com`,
    
    // Restrict iframe embedding to same origin
    `frame-ancestors 'self'`,
    
    // Prevent MIME type sniffing
    `base-uri 'self'`,
    
    // Form submissions only to same origin
    `form-action 'self'`,
  ];

  // In production only
  if (!isDev) {
    // Add sandbox directive
    directives.push(`sandbox allow-forms allow-same-origin allow-scripts allow-popups allow-downloads`);
    // Upgrade insecure requests
    directives.push(`upgrade-insecure-requests`);
  }

  return directives.join('; ');
}

/** Routes that require a logged-in user on the marketing domain. Everything else is public unless handled by tenant routing. */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding')
  )
}

function sanitizedRequestHeaders(request: NextRequest): Headers {
  const h = new Headers(request.headers);
  // Defense-in-depth: never let a client spoof tenant-identifying headers.
  // Only the middleware-computed values (set on the rewrite branches below)
  // may reach server components / RLS tenant context.
  h.delete('x-subdomain');
  h.delete('x-custom-domain');
  return h;
}

// Helper function to create an enhanced Supabase client with sanitization
function createEnhancedServerClient(
  supabaseUrl: string,
  supabaseKey: string,
  options: Parameters<typeof createOriginalServerClient>[2]
): SupabaseServerClient {
  return createOriginalServerClient(
    supabaseUrl,
    supabaseKey,
    options
  ) as SupabaseServerClient
}

export async function proxy(request: NextRequest) {
  // Handle static files and public routes - no processing needed
  const { pathname } = request.nextUrl;
  
  // Skip static files and public routes - no processing needed
  // BUT: Don't skip service worker - it needs CSP headers for image fetching
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.endsWith('/manifest.webmanifest') ||
    pathname.endsWith('/manifest.json') ||
    (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|mp4|webm|ogg|mp3|wav|pdf)$/) !== null && pathname !== '/sw.js')
  ) {
    return NextResponse.next();
  }
  
  // Special handling for service worker - apply CSP but skip other processing
  if (pathname === '/sw.js') {
    const nonce = generateNonce();
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.headers.set('x-nonce', nonce);
    response.headers.set('Content-Security-Policy', generateCsp(nonce));
    return response;
  }

  // Generate a unique nonce for this request
  const nonce = generateNonce();
  
  // Add security headers
  let response = NextResponse.next({
    request: {
      headers: sanitizedRequestHeaders(request),
    },
  });
  
  // Dynamic security headers (nonce-based CSP and permissions)
  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', generateCsp(nonce));
  response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');

  // Marketing-only mode: no Supabase env vars — serve public pages without auth/tenant logic
  if (!isSupabaseConfigured()) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return response
  }

  // Get client IP for API rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const [firstIp] = forwardedFor?.split(',') || [];
  const ip = firstIp || 
             request.headers.get('x-real-ip') || 
             'unknown';
             
  // Apply rate limiting for API routes (exclude webhooks and analytics)
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.includes('webhook') &&
      !request.nextUrl.pathname.includes('event') &&
      !request.nextUrl.pathname.includes('analytics')) {
    if (isRateLimited(ip)) {
      // Only log rate limits in production or for non-localhost IPs
      if (process.env.NODE_ENV === 'production' || !isLocalhostIp(ip)) {
        console.log(`Rate limit exceeded for IP: ${ip} on API route`);
      }
      
      // Return a 429 Too Many Requests response
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  // Create Supabase client with our sanitization enhancement
  const supabase = createEnhancedServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          response = NextResponse.next({
            request: {
              headers: sanitizedRequestHeaders(request),
            },
          })
          
          // Re-apply dynamic security headers when cookies are set
          response.headers.set('x-nonce', nonce)
          response.headers.set('Content-Security-Policy', generateCsp(nonce))
          response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()')
          
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // User auth check with proper error handling for session timeouts
  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Clear legacy auth cookie names; session may be invalid after refresh errors.
    const authCookies = ['sb-access-token', 'sb-refresh-token'];
    authCookies.forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });

    // Only force login on dashboard/onboarding — marketing pages must stay public.
    if (isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // Get the hostname from the request
  const originalHost = request.headers.get('host') || ''
  const hostname = normalizeDomain(originalHost)


  // Determine platform vs custom domain
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isPlatformHost = hostname.endsWith('localhost:3000') || hostname.endsWith('vercel.app') || isLocalhost;

  
  // If user hits www.custom-domain.tld, canonicalize to apex before proceeding
  if (originalHost.toLowerCase().startsWith('www.') && !isPlatformHost) {
    const redirectUrl = `${request.nextUrl.protocol}//${hostname}${request.nextUrl.pathname}${request.nextUrl.search}`
    return NextResponse.redirect(redirectUrl, 308)
  }

  // Extract subdomain only for platform hosts (e.g., subdomain.localhost:3000)
  const hasDomainStructure = hostname.includes('.') && !hostname.startsWith('localhost')

  
  let subdomain = '';
  let isValidSubdomain = false;
  
  // Special handling for localhost development with subdomains
  const localhostWithSubdomain = isLocalhost && hostname.includes('.');

  
  if (isPlatformHost && (hasDomainStructure || localhostWithSubdomain)) {
    const [firstPart] = hostname.split('.');
    subdomain = firstPart;

    
    // Skip system subdomains
    const systemSubdomains = ['www', 'app', 'localhost', 'opensupastripe-web', 'opensupastripe']
    isValidSubdomain = Boolean(subdomain) && !systemSubdomains.includes(subdomain)

  }
  
  // Handle tenant subdomain routing
  if (isValidSubdomain) {
    // console.log('MIDDLEWARE: Valid tenant subdomain detected:', subdomain)
    
    // Apply rate limiting (skip for cached tenants)
    if (!tenantCache.get(subdomain) && isRateLimited(ip)) {
      // Only log rate limits in production or for non-localhost IPs
      if (process.env.NODE_ENV === 'production' || !isLocalhostIp(ip)) {
        console.warn(`MIDDLEWARE: Rate limit exceeded for IP: ${ip}`);
      }
      
      // Return a 429 Too Many Requests response
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain',
        },
      });
    }
    
    try {

      
      // Use the cached tenant lookup function (context is set within the function)
      const tenant = await getTenant(supabase, subdomain, () =>
        createEnhancedServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
                response = NextResponse.next({
                  request: {
                    headers: request.headers,
                  },
                })
                response.headers.set('x-nonce', nonce)
                response.headers.set('Content-Security-Policy', generateCsp(nonce))
                response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()')
                cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options)
                )
              },
            },
          }
        )
      );
      

      
      if (!tenant) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Middleware: No tenant found for subdomain:', subdomain);
        }
        
        // Check if we're already on the not found page to prevent redirect loop
        if (request.nextUrl.pathname === '/organization-not-found') {
          return NextResponse.next();
        }
        
        // Redirect to custom organization not found page
        const url = request.nextUrl.clone()
        url.pathname = '/organization-not-found'
        url.hostname = url.hostname.replace(subdomain + '.', '') // Remove the invalid subdomain
        
        return NextResponse.redirect(url, 307)
      }
      
      // Set header for server components and propagate on the rewritten request
      response.headers.set('x-subdomain', subdomain)
      
      // Rewrite to tenant site route
      const url = request.nextUrl.clone()
      
      // Check if this is a research path that needs to be rewritten
      if (request.nextUrl.pathname.startsWith('/research/')) {
        url.pathname = `/tenant-site${request.nextUrl.pathname}`
      } else {
        url.pathname = `/tenant-site${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
      }
      // console.log('MIDDLEWARE: Rewriting to:', url.pathname)
      
      // Inject x-subdomain into request headers so server components can read it
      const forwardedRequestHeaders = new Headers(request.headers)
      forwardedRequestHeaders.delete('x-custom-domain')
      forwardedRequestHeaders.set('x-subdomain', subdomain)

      return NextResponse.rewrite(url, {
        request: {
          headers: forwardedRequestHeaders,
        },
        headers: response.headers,
      })
    } catch (err) {
      // console.error('MIDDLEWARE: Error checking organization:', err)
      
      // Check if the error is authentication-related
      if (err instanceof Error && 
          (err.message.includes('fetch failed') || 
           err.message.includes('auth') || 
           err.message.includes('Authentication'))) {
        // console.log('MIDDLEWARE: Authentication error during tenant lookup, redirecting to login')
        // Clear auth cookies
        const authCookies = ['sb-access-token', 'sb-refresh-token'];
        authCookies.forEach(cookieName => {
          response.cookies.delete(cookieName);
        });
      }
      return response
    }
  } else {
    // Check for direct access to tenant-site paths on localhost without subdomain
    if (isLocalhost && !localhostWithSubdomain && request.nextUrl.pathname.startsWith('/tenant-site/research')) {
      // Return 404 for direct access to tenant-site research paths on localhost without subdomain
      return new NextResponse('Not Found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Check if this is a custom domain (not a subdomain of the main domain)
    const isCustomDomain = !isPlatformHost && hasDomainStructure;

    if (isCustomDomain) {
      // console.log('MIDDLEWARE: Potential custom domain detected:', hostname);
      
      try {
        // Apply rate limiting (skip for cached domains)
        const cacheKey = `custom:${hostname}`;
        if (!tenantCache.get(cacheKey) && isRateLimited(ip)) {
          // Only log rate limits in production or for non-localhost IPs
          if (process.env.NODE_ENV === 'production' || !isLocalhostIp(ip)) {
            console.warn(`MIDDLEWARE: Rate limit exceeded for IP: ${ip} on custom domain`);
          }
          
          return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
              'Retry-After': '60',
              'Content-Type': 'text/plain',
            },
          });
        }
        
        // Use the enhanced custom domain lookup function (context is set within the function)
        const tenant = await getTenantByCustomDomain(supabase, hostname, () =>
          createEnhancedServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              cookies: {
                getAll() {
                  return request.cookies.getAll()
                },
                setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
                  response = NextResponse.next({
                    request: {
                      headers: request.headers,
                    },
                  })
                  response.headers.set('x-nonce', nonce)
                  response.headers.set('Content-Security-Policy', generateCsp(nonce))
                  response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()')
                  cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                  )
                },
              },
            }
          )
        );
          
        if (!tenant) {
          // Only log in development to avoid spam
          if (process.env.NODE_ENV === 'development') {

          }
          // Redirect to custom organization not found page
          const url = request.nextUrl.clone()
          url.pathname = '/organization-not-found'
          url.hostname = 'localhost:3000' // Redirect to main domain
          return NextResponse.redirect(url, 307)
        }
        
        // Set header for server components - using x-custom-domain
        response.headers.set('x-custom-domain', hostname);
        
        // Rewrite to tenant site route
        const url = request.nextUrl.clone();
        url.pathname = `/tenant-site${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`;
        // console.log('MIDDLEWARE: Rewriting custom domain to:', url.pathname);
        
        // Inject x-custom-domain into request headers so server components can read it
        const forwardedRequestHeaders = new Headers(request.headers)
        forwardedRequestHeaders.delete('x-subdomain')
        forwardedRequestHeaders.set('x-custom-domain', hostname)

        return NextResponse.rewrite(url, {
          request: {
            headers: forwardedRequestHeaders,
          },
          headers: response.headers,
        });
      } catch (err) {
        console.error('MIDDLEWARE: Error checking custom domain:', err);
        return response;
      }
    }
  }

  // Public marketing & auth routes: no login required (avoid maintaining a brittle allowlist).
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return response
  }

  // Dashboard / onboarding only
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
