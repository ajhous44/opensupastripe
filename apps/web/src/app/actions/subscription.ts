'use server'

import { cache } from 'react'
import { LRUCache } from 'lru-cache'
import { createClient } from '@/lib/supabase-server'
import type { SubscriptionPlan, OrganizationSubscription } from '@/lib/subscription-utils'
import { getStripeClient } from '@/lib/stripe-server'

const subscriptionPlansCache = new LRUCache<string, SubscriptionPlan[]>({
  max: 1,
  ttl: 5 * 60 * 1000
})

/**
 * Get all active subscription plans
 */
export const getSubscriptionPlans = cache(async () => {
  const cachedPlans = subscriptionPlansCache.get('active')
  if (cachedPlans) {
    return { data: cachedPlans, error: null }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, stripe_price_id, name, description, price_cents, currency, billing_interval, features')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching subscription plans:', error)
    return { data: null, error: error.message }
  }
  
  subscriptionPlansCache.set('active', data as SubscriptionPlan[])
  return { data: data as SubscriptionPlan[], error: null }
})

/**
 * Get subscription for a specific organization
 */
export const getOrganizationSubscription = cache(async (organizationId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select('organization_id, organization_name, subdomain, subscription_id, subscription_status, current_period_end, trial_end, plan_name, price_cents, currency, billing_interval')
    .eq('organization_id', organizationId)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching organization subscription:', error)
    return { data: null, error: error.message }
  }
  
  return { data: data as OrganizationSubscription | null, error: null }
})

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_plans:plan_id (
        name,
        description,
        billing_interval,
        features
      ),
      organizations:organization_id (
        name,
        subdomain
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user subscriptions:', error)
    return { data: null, error: error.message }
  }
  
  return { data: data as any[], error: null }
}

/**
 * Create a Stripe customer portal session for organization billing management
 */
export async function createBillingPortalSession(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!organization) {
    return { data: null, error: 'Unauthorized organization access' }
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
    return { data: null, error: 'No Stripe customer found for this organization' }
  }

  try {
    const stripe = getStripeClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard/manage-subscription`,
    })

    return { data: { url: session.url }, error: null }
  } catch (error) {
    console.error('Error creating Stripe portal session:', error)
    return { data: null, error: 'Failed to create billing portal session' }
  }
}

/**
 * Check if user has access to a organization based on subscription
 */
export async function checkOrganizationAccess(organizationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { hasAccess: false, reason: 'Not authenticated' }
  }
  
  // Check if user owns the organization or is a team member
  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('owner_id, subscription_status')
    .eq('id', organizationId)
    .single()
  
  if (organizationError || !organization) {
    return { hasAccess: false, reason: 'Organization not found' }
  }
  
  const isOwner = organization.owner_id === user.id
  
  // Check if user is a team member
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (!isOwner && !teamMember) {
    return { hasAccess: false, reason: 'Not authorized to access this organization' }
  }
  
  // Check subscription status (only for owners/admins, staff can still access)
  const userRole = isOwner ? 'owner' : teamMember?.role
  if (userRole === 'owner' || userRole === 'admin') {
    const { data: subscription } = await getOrganizationSubscription(organizationId)
    
    if (!subscription || !subscription.subscription_status) {
      return { 
        hasAccess: false, 
        reason: 'No active subscription',
        needsSubscription: true 
      }
    }
    
    const activeStatuses = ['active', 'on_trial']
    if (!activeStatuses.includes(subscription.subscription_status)) {
      return { 
        hasAccess: false, 
        reason: `Subscription is ${subscription.subscription_status}`,
        needsSubscription: true 
      }
    }
    
    return { hasAccess: true, subscription, role: userRole }
  }
  
  // Staff members have access regardless of subscription
  return { hasAccess: true, role: userRole }
}
