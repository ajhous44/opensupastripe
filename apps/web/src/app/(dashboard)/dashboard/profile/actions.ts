'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server-admin'
import { getStripeClient } from '@/lib/stripe-server'

/**
 * Delete a user account and all associated data
 * @param userId The ID of the user to delete
 */
export async function deleteUserAccount(userId: string) {
  // Regular client for most operations
  const supabase = await createClient()
  // Admin client for destructive ops (storage, auth)
  const adminClient = await createAdminClient()
  
  try {
    // Authorization check: ensure the user can only delete their own account
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return { success: false, error: 'Unauthorized: You can only delete your own account' }
    }
    
    // 1. Get ALL organizations owned by the user
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id, subdomain')
      .eq('owner_id', userId)

    if (organizations && organizations.length > 0) {
      // Helper: recursively list all files under a prefix for a bucket
      const listAllFiles = async (
        bucket: string,
        prefix: string
      ): Promise<string[]> => {
        const files: string[] = []

        const walk = async (currentPrefix: string) => {
          let offset = 0
          const limit = 100
          while (true) {
            const { data: entries, error } = await adminClient.storage
              .from(bucket)
              .list(currentPrefix, {
                limit,
                offset,
                sortBy: { column: 'name', order: 'asc' },
              })

            if (error) {
              console.error(`[DELETE] list error for ${bucket}/${currentPrefix}:`, error)
              break
            }

            if (!entries || entries.length === 0) {
              break
            }

            for (const entry of entries) {
              // Try to detect folders by attempting to walk into them
              // Storage API doesn't flag folders explicitly; treat entries with metadata?.size as files
              const isFile = (entry as any)?.metadata?.size !== undefined
              if (isFile) {
                const path = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name
                files.push(path)
              } else {
                const nextPrefix = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name
                await walk(nextPrefix)
              }
            }

            if (entries.length < limit) {
              break
            }
            offset += limit
          }
        }

        await walk(prefix)
        return files
      }

      const deleteInBatches = async (bucket: string, paths: string[], batchSize = 100) => {
        for (let i = 0; i < paths.length; i += batchSize) {
          const batch = paths.slice(i, i + batchSize)
          const { error } = await adminClient.storage.from(bucket).remove(batch)
          if (error) {
            console.error(`[DELETE] remove error for ${bucket} batch starting at ${i}:`, error)
          } else {
            console.log(`[DELETE] removed ${batch.length} objects from ${bucket}`)
          }
        }
      }

      for (const organization of organizations) {
        try {
          const assetPaths = await listAllFiles('organization-assets', organization.id)
          if (assetPaths.length > 0) {
            await deleteInBatches('organization-assets', assetPaths)
          }
        } catch (error) {
          console.error('[DELETE] organization-assets cleanup error:', { organizationId: organization.id, error })
        }
      }

      // 4. Organization and related data will be deleted via cascading deletes due to foreign keys
    }
    
    // 4b. Cancel active Stripe subscriptions for owned organizations (best-effort)
    try {
      const ownedOrganizationIds = (organizations || []).map(d => d.id)
      if (ownedOrganizationIds.length > 0) {
        const { data: subsToCancel } = await adminClient
          .from('subscriptions')
          .select('id, stripe_subscription_id, status, organization_id')
          .in('organization_id', ownedOrganizationIds)
          .in('status', ['active', 'on_trial'])

        const stripe = getStripeClient()
        const cancelOne = async (stripeSubId: string) => {
          await stripe.subscriptions.cancel(stripeSubId)
        }

        if (subsToCancel && subsToCancel.length > 0) {
          for (const sub of subsToCancel) {
            if (!sub.stripe_subscription_id) continue
            try {
              await cancelOne(sub.stripe_subscription_id)
              // Reflect immediately; webhook will also reconcile
              await adminClient
                .from('subscriptions')
                .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
                .eq('id', sub.id)
            } catch (error) {
              console.error('[DELETE] Failed to cancel Stripe subscription:', {
                stripe_subscription_id: sub.stripe_subscription_id,
                error,
              })
              // Continue; we will mark manual intervention below
            }
          }
        }
      }
    } catch (error) {
      console.error('[DELETE] Error during subscription cancellation step:', error)
      // Do not throw; proceed with account deletion but the result will capture error
    }

    // 5. Delete the user account using the admin API with admin privileges
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      throw deleteError
    }
    
    // 6. Clear cookies - this is handled automatically by the sign-out process
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting account:', error)
    
    // Handle network errors or other fatal errors that might leave the account in a partially deleted state
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // For certain types of errors, mark the deletion as needing manual intervention
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.toLowerCase().includes('stripe') ||
      errorMessage.toLowerCase().includes('subscription')
    ) {
      return { 
        success: false, 
        error: errorMessage, 
        needsManualIntervention: true 
      }
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
} 