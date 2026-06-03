import type { Metadata } from 'next'
import { LandingHero } from '@/components/marketing-home/landing-hero'
import { LandingSections } from '@/components/marketing-home/landing-sections'
import { MarketingHomeLayout } from '@/components/marketing-home/marketing-home-layout'
import { createClient } from '@/lib/supabase-server'
import { isSupabaseConfigured } from '@/lib/supabase-config'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Company — Multitenant SaaS Starter',
  description: 'Production-ready multitenant SaaS starter with Supabase, Stripe, and Vercel.',
}

export default async function HomePage() {
  let isSignedIn = false

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      isSignedIn = !!user
    } catch {
      // Auth unavailable — render as logged-out
    }
  }

  return (
    <MarketingHomeLayout>
      <LandingHero isSignedIn={isSignedIn} />
      <LandingSections />
    </MarketingHomeLayout>
  )
}
