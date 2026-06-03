import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { getStripeClient } from '@/lib/stripe-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

let _supabaseAdmin: SupabaseClient<any, 'public', any> | null = null

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return _supabaseAdmin
}

const WEBHOOK_LOG_PREFIX = '[STRIPE_WEBHOOK]'

const logInfo = (message: string, data?: Record<string, unknown>) =>
  logger.info(`${WEBHOOK_LOG_PREFIX} ${message}`, data)
const logError = (message: string, error?: unknown) =>
  logger.error(`${WEBHOOK_LOG_PREFIX} ${message}`, error)

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'on_trial'
    case 'canceled':
      return 'cancelled'
    case 'incomplete_expired':
      return 'expired'
    default:
      return status
  }
}

function toIso(timestamp: number | null | undefined): string | null {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

function getSubscriptionPeriodTimestamps(stripeSubscription: Stripe.Subscription) {
  const subscriptionWithPeriod = stripeSubscription as unknown as {
    current_period_start?: number
    current_period_end?: number
  }
  const [firstItem] = stripeSubscription.items.data as unknown as Array<{
    current_period_start?: number
    current_period_end?: number
  }>

  return {
    currentPeriodStart: subscriptionWithPeriod.current_period_start ?? firstItem?.current_period_start ?? null,
    currentPeriodEnd: subscriptionWithPeriod.current_period_end ?? firstItem?.current_period_end ?? null,
  }
}

async function resolveOrganizationId(stripeSubscription: Stripe.Subscription): Promise<string | null> {
  const direct = stripeSubscription.metadata?.organization_id
  if (direct) return direct

  const stripeSubscriptionId = stripeSubscription.id
  const { data } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle() as { data: { organization_id: string } | null }
  return data?.organization_id ?? null
}

async function resolvePlanId(stripeSubscription: Stripe.Subscription): Promise<string | null> {
  const [firstItem] = stripeSubscription.items.data
  const priceId = firstItem?.price?.id
  if (!priceId) return null

  const { data } = await getSupabaseAdmin()
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .maybeSingle() as { data: { id: string } | null }

  return data?.id ?? null
}

async function upsertSubscriptionFromStripe(stripeSubscription: Stripe.Subscription) {
  const organizationId = await resolveOrganizationId(stripeSubscription)
  const planId = await resolvePlanId(stripeSubscription)
  const userId = stripeSubscription.metadata?.user_id

  if (!organizationId || !planId || !userId) {
    throw new Error('Missing organization_id, plan_id, or user_id for subscription upsert')
  }

  const [firstItem] = stripeSubscription.items.data
  const currency = firstItem?.price?.currency?.toUpperCase() || 'USD'
  const unitAmount = firstItem?.price?.unit_amount ?? 0
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriodTimestamps(stripeSubscription)

  const now = new Date().toISOString()
  const payload = {
    stripe_subscription_id: stripeSubscription.id,
    stripe_invoice_id:
      typeof stripeSubscription.latest_invoice === 'string'
        ? stripeSubscription.latest_invoice
        : null,
    stripe_customer_id:
      typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer.id,
    organization_id: organizationId,
    user_id: userId,
    plan_id: planId,
    status: mapStripeStatus(stripeSubscription.status),
    current_period_start: toIso(currentPeriodStart) ?? now,
    current_period_end: toIso(currentPeriodEnd) ?? now,
    trial_start: toIso(stripeSubscription.trial_start),
    trial_end: toIso(stripeSubscription.trial_end),
    cancelled_at: toIso(stripeSubscription.canceled_at),
    price_cents: unitAmount,
    currency,
    metadata: stripeSubscription as unknown as Record<string, unknown>,
    updated_at: now,
  }

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('subscriptions')
    .upsert(payload, { onConflict: 'stripe_subscription_id' })

  if (error) throw error

  await admin
    .from('organizations')
    .update({ subscription_status: payload.status, updated_at: new Date().toISOString() })
    .eq('id', organizationId)
}

async function updateSubscriptionStatus(
  stripeSubscription: Stripe.Subscription,
  statusOverride?: string
) {
  const newStatus = statusOverride ?? mapStripeStatus(stripeSubscription.status)
  const stripeSubscriptionId = stripeSubscription.id
  const organizationId = await resolveOrganizationId(stripeSubscription)
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriodTimestamps(stripeSubscription)

  const admin = getSupabaseAdmin()
  const periodStart = toIso(currentPeriodStart) ?? new Date().toISOString()
  const periodEnd = toIso(currentPeriodEnd) ?? periodStart
  const { error } = await admin
    .from('subscriptions')
    .update({
      status: newStatus,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancelled_at: toIso(stripeSubscription.canceled_at),
      stripe_invoice_id:
        typeof stripeSubscription.latest_invoice === 'string'
          ? stripeSubscription.latest_invoice
          : null,
      metadata: stripeSubscription as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) throw error

  if (organizationId) {
    await admin
      .from('organizations')
      .update({ subscription_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', organizationId)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let eventType = 'unknown'
  let stripeSubscriptionId = ''
  let eventRowId: string | null = null

  try {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 })
    }

    const stripe = getStripeClient()
    const rawBody = await request.text()
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    eventType = event.type
    logInfo('Incoming event', { eventType, eventId: event.id })

    const stripeObject = event.data.object as unknown as Record<string, unknown>
    stripeSubscriptionId =
      typeof stripeObject.id === 'string' &&
      (event.type.startsWith('customer.subscription') || event.type.startsWith('invoice'))
        ? stripeObject.id
        : ''

    const admin = getSupabaseAdmin()
    const { data: eventRow } = await admin
      .from('subscription_events')
      .insert({
        event_name: event.type,
        stripe_subscription_id:
          event.type.startsWith('customer.subscription')
            ? (event.data.object as Stripe.Subscription).id
            : null,
        stripe_invoice_id: event.type.startsWith('invoice.')
          ? (event.data.object as Stripe.Invoice).id
          : null,
        webhook_data: event as unknown as Record<string, unknown>,
        processed: false,
      })
      .select('id')
      .single() as { data: { id: string } | null }
    eventRowId = eventRow?.id ?? null

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscriptionFromStripe(subscription)
        stripeSubscriptionId = subscription.id
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscriptionFromStripe(subscription)
        stripeSubscriptionId = subscription.id
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(subscription, 'cancelled')
        stripeSubscriptionId = subscription.id
        break
      }
      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(subscription, 'paused')
        stripeSubscriptionId = subscription.id
        break
      }
      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscriptionFromStripe(subscription)
        stripeSubscriptionId = subscription.id
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const invoiceWithSubscription = invoice as unknown as {
          subscription?: string | { id: string } | null
        }
        const invoiceSubscription = invoiceWithSubscription.subscription
        const subscriptionId =
          typeof invoiceSubscription === 'string'
            ? invoiceSubscription
            : invoiceSubscription?.id
        if (!subscriptionId) break
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await updateSubscriptionStatus(sub)
        stripeSubscriptionId = sub.id
        break
      }
      case 'invoice.payment_failed':
      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice
        const invoiceWithSubscription = invoice as unknown as {
          subscription?: string | { id: string } | null
        }
        const invoiceSubscription = invoiceWithSubscription.subscription
        const subscriptionId =
          typeof invoiceSubscription === 'string'
            ? invoiceSubscription
            : invoiceSubscription?.id
        if (!subscriptionId) break
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await updateSubscriptionStatus(sub, 'past_due')
        stripeSubscriptionId = sub.id
        break
      }
      default:
        break
    }

    if (eventRowId) {
      await admin
        .from('subscription_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', eventRowId)
    }

    logInfo('Event processed', {
      eventType,
      stripeSubscriptionId,
      durationMs: Date.now() - startTime,
    })
    return NextResponse.json({ received: true })
  } catch (error) {
    logError('Webhook processing failed', { eventType, stripeSubscriptionId, error })

    if (eventRowId) {
      await getSupabaseAdmin()
        .from('subscription_events')
        .update({
          processed: true,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString(),
        })
        .eq('id', eventRowId)
    }

    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
