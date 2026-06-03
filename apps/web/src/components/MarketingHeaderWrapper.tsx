import { createClient } from '@/lib/supabase-server'
import { isSupabaseConfigured } from '@/lib/supabase-config'
import MarketingHeader from './MarketingHeader'

export default async function MarketingHeaderWrapper() {
  let initialUser = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      initialUser = user
    } catch {
      // Auth check failed — render as logged-out
    }
  }

  return <MarketingHeader initialUser={initialUser} />
}
