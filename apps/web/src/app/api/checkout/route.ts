import { NextResponse } from 'next/server'
import { createServerClient, type SetAllCookies } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { getStripeClient } from '@/lib/stripe-server'

const checkoutRateLimitStore = new Map<string, { requests: number; resetTime: number }>()
const CHECKOUT_RATE_LIMIT_REQUESTS = 5
const CHECKOUT_RATE_LIMIT_WINDOW_MS = 60 * 1000
const CHECKOUT_LOG_PREFIX = '[CHECKOUT]'

const logInfo = (message: string, data?: Record<string, unknown>) =>
  logger.info(`${CHECKOUT_LOG_PREFIX} ${message}`, data)
const logWarn = (message: string, data?: Record<string, unknown>) =>
  logger.warn(`${CHECKOUT_LOG_PREFIX} ${message}`, data)
const logError = (message: string, error?: unknown) =>
  logger.error(`${CHECKOUT_LOG_PREFIX} ${message}`, error)

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined
}

function checkCheckoutRateLimit(clientIP: string) {
  const now = Date.now()
  const existing = checkoutRateLimitStore.get(clientIP)

  if (!existing || now > existing.resetTime) {
    checkoutRateLimitStore.set(clientIP, {
      requests: 1,
      resetTime: now + CHECKOUT_RATE_LIMIT_WINDOW_MS,
    })
    return true
  }

  if (existing.requests >= CHECKOUT_RATE_LIMIT_REQUESTS) {
    return false
  }

  existing.requests += 1
  return true
}

export async function POST(request: Request) {
  const startTime = Date.now()
  let userId = 'unknown'
  let organizationId = 'unknown'

  try {
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkCheckoutRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    let selectedPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || ''
    const body = await request.json().catch(() => null)
    if (body && typeof body.priceId === 'string' && body.priceId.trim().length > 0) {
      selectedPriceId = body.priceId.trim()
    }

    const requiredEnvVars = ['STRIPE_SECRET_KEY']
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])
    if (missingEnvVars.length > 0) {
      logWarn('Missing required environment variables', { missingEnvVars })
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing required environment variables' },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Server Component fallback.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      logError('Authentication failed', userError || undefined)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    userId = user.id
    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('id, name, subdomain')
      .eq('owner_id', user.id)
      .single()

    if (organizationError || !organization) {
      logError('Organization lookup failed', organizationError || undefined)
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    organizationId = organization.id

    const planSelect =
      'id, name, stripe_price_id, price_cents, currency' as const

    let plan: {
      id: string
      name: string
      stripe_price_id: string
      price_cents: number
      currency: string
    } | null = null

    if (selectedPriceId) {
      const { data: planByPrice } = await supabase
        .from('subscription_plans')
        .select(planSelect)
        .eq('stripe_price_id', selectedPriceId)
        .eq('is_active', true)
        .maybeSingle()

      plan = planByPrice
    }

    if (!plan) {
      const { data: defaultPlan } = await supabase
        .from('subscription_plans')
        .select(planSelect)
        .eq('is_active', true)
        .order('price_cents', { ascending: false })
        .limit(1)
        .maybeSingle()

      plan = defaultPlan

      if (plan) {
        logWarn('Checkout price id fallback to active subscription plan', {
          requestedPriceId: selectedPriceId || null,
          resolvedPriceId: plan.stripe_price_id,
        })
        selectedPriceId = plan.stripe_price_id
      }
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not available' },
        { status: 400 }
      )
    }

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('organization_id', organization.id)
      .in('status', ['active', 'on_trial'])
      .maybeSingle()

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      )
    }

    const stripe = getStripeClient()

    const { data: lastSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organization.id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let stripeCustomerId = lastSubscription?.stripe_customer_id || ''
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: organization.name,
        metadata: {
          user_id: user.id,
          organization_id: organization.id,
          organization_name: organization.name,
          organization_subdomain: organization.subdomain || '',
        },
      })
      stripeCustomerId = customer.id
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000'
    const cookieHeader = request.headers.get('cookie')
    const metaFbp = getCookieValue(cookieHeader, '_fbp')
    const metaFbc = getCookieValue(cookieHeader, '_fbc')
    const checkoutCouponId = process.env.STRIPE_CHECKOUT_COUPON_ID?.trim()

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription' as const,
      customer: stripeCustomerId,
      ...(checkoutCouponId ? { discounts: [{ coupon: checkoutCouponId }] } : {}),
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        organization_id: organization.id,
        ...(metaFbp ? { meta_fbp: metaFbp } : {}),
        ...(metaFbc ? { meta_fbc: metaFbc } : {}),
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          organization_id: organization.id,
          plan_id: plan.id,
          ...(metaFbp ? { meta_fbp: metaFbp } : {}),
          ...(metaFbc ? { meta_fbc: metaFbc } : {}),
        },
      },
      success_url: `${appUrl}/dashboard/manage-subscription?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    logInfo('Stripe checkout created', {
      userId,
      organizationId,
      priceId: selectedPriceId,
      checkoutSessionId: checkoutSession.id,
      checkoutAutoCoupon: Boolean(checkoutCouponId),
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({
      url: checkoutSession.url,
      checkoutSessionId: checkoutSession.id,
      plan: {
        id: plan.id,
        name: plan.name,
        priceCents: plan.price_cents,
        currency: plan.currency || 'USD',
      },
    })
  } catch (error) {
    logError('Checkout creation failed', {
      error,
      userId,
      organizationId,
      durationMs: Date.now() - startTime,
    })
    return NextResponse.json(
      {
        error: 'Failed to create checkout',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
