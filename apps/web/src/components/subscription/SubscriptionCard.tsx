'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock 
} from 'lucide-react'
import { 
  formatPrice, 
  formatBillingInterval, 
  getSubscriptionStatusLabel, 
  isSubscriptionActive, 
  isSubscriptionOnTrial,
  getTrialDaysRemaining,
  type OrganizationSubscription
} from '@/lib/subscription-utils'
import { getCheckoutErrorMessage } from '@/lib/checkout-errors'

function extractPlainTextFromHtml(html?: string): string {
  if (!html) return ''
  try {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div')
      div.innerHTML = html
      return (div.textContent || div.innerText || '').trim()
    }
  } catch {}
  // SSR-safe fallback
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function redirectToUrl(url: string) {
  window.location.assign(url)
}

interface SubscriptionCardProps {
  subscription: OrganizationSubscription | null
  organizationId: string
  userId: string
  plans: Array<{
    id: string
    stripe_price_id: string
    name: string
    description?: string
    price_cents: number
    currency: string
    billing_interval: string
    features: string[]
  }>
}

export default function SubscriptionCard({ 
  subscription, 
  organizationId,
  userId: _userId, 
  plans 
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  
  const isActive = isSubscriptionActive({ status: subscription?.subscription_status as any })
  const isOnTrial = isSubscriptionOnTrial({ 
    status: subscription?.subscription_status as any, 
    trial_end: subscription?.trial_end 
  })
  const trialDaysRemaining = getTrialDaysRemaining({ trial_end: subscription?.trial_end })
  const statusInfo = getSubscriptionStatusLabel(subscription?.subscription_status)
  
  const handleUpgrade = async (priceId?: string) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceId ? { priceId } : {}),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error('Checkout request failed:', { status: response.status, data })
        alert(getCheckoutErrorMessage(typeof data.error === 'string' ? data.error : undefined, response.status))
        return
      }
      
      if (data.url) {
        redirectToUrl(data.url)
      } else {
        console.error('No checkout URL returned:', data)
        alert(getCheckoutErrorMessage(typeof data.error === 'string' ? data.error : undefined, response.status))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(getCheckoutErrorMessage(undefined, 500))
    } finally {
      setLoading(false)
    }
  }
  
  const handleManageBilling = async () => {
    if (!subscription?.subscription_id) return
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      })
      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
        return
      }
      alert(data.error || 'Failed to open billing portal')
    } catch (error) {
      console.error('Billing portal error:', error)
      alert('Failed to open billing portal')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
          <div className="flex items-center gap-2">
            <div 
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {statusInfo.color === 'green' ? <CheckCircle className="w-3 h-3" /> :
               statusInfo.color === 'blue' ? <Clock className="w-3 h-3" /> :
               statusInfo.color === 'red' || statusInfo.color === 'orange' ? <AlertTriangle className="w-3 h-3" /> :
               <Clock className="w-3 h-3" />}
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Current Subscription Info */}
        {subscription && isActive ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{subscription.plan_name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {formatPrice(subscription.price_cents || 0, subscription.currency || 'USD')} / 
                    {formatBillingInterval(subscription.billing_interval || 'month')}
                  </span>
                </div>
                
                {subscription.current_period_end && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Trial Warning */}
            {isOnTrial && trialDaysRemaining > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Your trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleManageBilling}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </button>
            </div>
          </div>
        ) : (
          /* No Subscription */
          <div className="space-y-4">
            <div className="text-center py-6">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">No Active Subscription</h4>
              <p className="text-sm text-gray-600">
                Subscribe to unlock all features and manage your organization.
              </p>
            </div>
            
            {/* Available Plans */}
            {plans && plans.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-900">Available Plans</h5>
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-900">{plan.name}</h6>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(plan.price_cents, plan.currency)}
                        <span className="text-sm font-normal text-gray-600">
                          /{formatBillingInterval(plan.billing_interval)}
                        </span>
                      </span>
                    </div>
                    
                    {plan.description && (
                      <p className="text-sm text-gray-600 mb-3">{extractPlainTextFromHtml(plan.description)}</p>
                    )}
                    
                    {plan.features && plan.features.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-1 mb-3">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-gray-500">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    )}
                    
                    <button
                      onClick={() => handleUpgrade(plan.stripe_price_id)}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </div>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
