import 'server-only'

import { createAdminClient } from '@/lib/supabase-server-admin'

const ACTIVE_STATUSES = new Set(['active', 'on_trial'])

export async function hasPaidSubscription(organizationId: string): Promise<boolean> {
  if (!organizationId) return false

  const admin = await createAdminClient()

  const { data: subscriptionRow } = await admin
    .from('organization_subscriptions')
    .select('subscription_status')
    .eq('organization_id', organizationId)
    .maybeSingle()

  const status = (subscriptionRow as { subscription_status?: string } | null)?.subscription_status
  if (status && ACTIVE_STATUSES.has(status)) return true

  const { data: organizationRow } = await admin
    .from('organizations')
    .select('subscription_status')
    .eq('id', organizationId)
    .maybeSingle()

  const fallbackStatus = (organizationRow as { subscription_status?: string } | null)?.subscription_status
  return Boolean(fallbackStatus && ACTIVE_STATUSES.has(fallbackStatus))
}
