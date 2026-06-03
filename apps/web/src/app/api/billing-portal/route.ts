import { NextResponse } from 'next/server'
import { createServerClient, type SetAllCookies } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripeClient } from '@/lib/stripe-server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const organizationId = typeof body.organizationId === 'string' ? body.organizationId : ''
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })
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
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!organization) {
      return NextResponse.json({ error: 'Unauthorized organization access' }, { status: 403 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .in('status', ['active', 'on_trial', 'past_due'])
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
    }

    const stripe = getStripeClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard/manage-subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create billing portal session',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
