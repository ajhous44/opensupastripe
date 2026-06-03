export interface SubscriptionPlan {
  id: string
  stripe_product_id: string
  stripe_price_id: string
  name: string
  description?: string
  price_cents: number
  currency: string
  billing_interval: 'month' | 'year'
  billing_interval_count: number
  trial_days: number
  sort_order: number
  is_active: boolean
  features: string[]
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  stripe_subscription_id: string
  stripe_invoice_id?: string
  stripe_customer_id: string
  organization_id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused' | 'unpaid' | 'on_trial'
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  price_cents: number
  currency: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrganizationSubscription {
  organization_id: string
  organization_name: string
  subdomain: string
  subscription_id?: string
  subscription_status?: string
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  plan_name?: string
  price_cents?: number
  currency?: string
  billing_interval?: string
}

export interface OrganizationSubscription {
  organization_id: string
  organization_name: string
  subdomain: string
  subscription_id?: string
  subscription_status?: string
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  plan_name?: string
  price_cents?: number
  currency?: string
  billing_interval?: string
}

/**
 * Format price in cents to display format
 */
export function formatPrice(priceCents: number, currency: string | null | undefined = 'USD'): string {
  const safeCurrency = (currency || 'USD').toUpperCase()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
  }).format(priceCents / 100)
}

/**
 * Format billing interval for display
 */
export function formatBillingInterval(interval: string, count: number = 1): string {
  if (count === 1) {
    return interval === 'month' ? 'month' : 'year'
  }
  return `${count} ${interval}s`
}

/**
 * Check if subscription is active (including trial)
 */
export function isSubscriptionActive(subscription?: Pick<Subscription, 'status'>): boolean {
  return subscription?.status === 'active' || subscription?.status === 'on_trial'
}

/**
 * Check if subscription is in trial period
 */
export function isSubscriptionOnTrial(subscription?: Pick<Subscription, 'status' | 'trial_end'>): boolean {
  if (subscription?.status !== 'on_trial' || !subscription?.trial_end) {
    return false
  }
  
  return new Date(subscription.trial_end) > new Date()
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription?: Pick<Subscription, 'trial_end'>): number {
  if (!subscription?.trial_end) {
    return 0
  }
  
  const trialEnd = new Date(subscription.trial_end)
  const now = new Date()
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

/**
 * Get subscription status with user-friendly labels
 */
export function getSubscriptionStatusLabel(status?: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    on_trial: { label: 'Trial', color: 'blue' },
    cancelled: { label: 'Cancelled', color: 'orange' },
    expired: { label: 'Expired', color: 'red' },
    past_due: { label: 'Past Due', color: 'red' },
    paused: { label: 'Paused', color: 'yellow' },
    unpaid: { label: 'Unpaid', color: 'red' },
    inactive: { label: 'No Subscription', color: 'gray' }
  }
  
  return statusMap[status || 'inactive'] || { label: 'Unknown', color: 'gray' }
}