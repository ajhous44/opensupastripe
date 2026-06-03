import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SubscriptionCard from '@/components/subscription/SubscriptionCard'
import { getSubscriptionPlans, getOrganizationSubscription } from '@/app/actions/subscription'
import { DASHBOARD_PAGE_GUTTER } from '@/lib/dashboard-page-gutter'
import { CreditCard, Zap, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Manage Subscription | My Company Dashboard',
  description: 'Manage your My Company subscription and billing',
}

export default async function ManageSubscriptionPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get user's organizations (owned + team member) in parallel - they are independent
  const [ownedResult, teamMemberResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, subdomain, owner_id')
      .eq('owner_id', user.id)
      .maybeSingle(),
    supabase
      .from('team_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
  ])

  const ownedOrganization = ownedResult.data
  const teamMember = teamMemberResult.data

  // Fetch team member organization if exists (depends on teamMember result)
  let teamOrganization: any = null
  if (teamMember) {
    const { data: organizationData } = await supabase
      .from('organizations')
      .select('id, name, subdomain, owner_id')
      .eq('id', teamMember.organization_id)
      .single()
    teamOrganization = organizationData
  }

  // Determine current organization (prefer owned, fallback to team member)
  const organization = ownedOrganization || teamOrganization
  const userRole = ownedOrganization ? 'owner' : teamMember?.role

  if (!organization) {
    redirect('/dashboard')
  }

  // Staff cannot access billing
  if (userRole === 'staff') {
    redirect('/dashboard')
  }

  // Get subscription data
  const [plansResult, subscriptionResult] = await Promise.all([
    getSubscriptionPlans(),
    getOrganizationSubscription(organization.id)
  ])

  if (plansResult.error) {
    console.error('Error loading plans:', plansResult.error)
  }

  if (subscriptionResult.error) {
    console.error('Error loading subscription:', subscriptionResult.error)
  }

  const plans = plansResult.data || []
  const subscription = subscriptionResult.data

  return (
    <div className={`p-6 ${DASHBOARD_PAGE_GUTTER}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Subscription</h1>
            <p className="text-gray-600">View and manage your My Company subscription and billing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Subscription Card */}
        <div className="lg:col-span-2">
          <SubscriptionCard
            subscription={subscription}
            organizationId={organization.id}
            userId={user.id}
            plans={plans}
          />
        </div>

        {/* Sidebar with benefits and info */}
        <div className="space-y-6">
          {/* Subscription Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Why Subscribe?</h3>
            </div>
            
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Unlimited team members on Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Multitenant organization workspaces</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Custom subdomain support</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Stripe billing &amp; subscription management</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Role-based access control</span>
              </li>
            </ul>
          </div>

          {/* Billing Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Billing Info</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium text-gray-900 mb-1">Payment Method</div>
                <div className="text-gray-600">
                  {subscription?.subscription_status === 'active' || subscription?.subscription_status === 'on_trial'
                    ? 'Managed through Stripe'
                    : 'No payment method on file'
                  }
                </div>
              </div>
              
              {subscription?.current_period_end ? (
                <div>
                  <div className="font-medium text-gray-900 mb-1">Next Billing Date</div>
                  <div className="text-gray-600">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ) : null}
              
              <div>
                <div className="font-medium text-gray-900 mb-1">Billing Support</div>
                <div className="text-gray-600">
                  For billing questions, contact{' '}
                  <a 
                    href="mailto:hello@mycompany.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    hello@mycompany.com
                  </a>
                  {' '}or use in-app chat from your dashboard.
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5C3.312 18.333 4.271 20 5.81 20z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-yellow-800 mb-1">Secure Payments</div>
                <div className="text-xs text-yellow-700">
                  All payments are processed securely through Stripe.
                  Your payment information is never stored on our servers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 