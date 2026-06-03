'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { HeroAnimatedTitle } from '@/components/marketing-home/hero-animated-title'
import { HeroBrandAurora } from '@/components/marketing-home/hero-brand-aurora'
import { HeroDashboardMockup } from '@/components/marketing-home/hero-dashboard-mockup'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import Particles from '@/components/ui/particles'
import { Spotlight } from '@/components/ui/spotlight'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: [0.4, 0, 0.2, 1] as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.09,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
  },
}

type LandingHeroProps = {
  isSignedIn?: boolean
}

export function LandingHero({ isSignedIn = false }: LandingHeroProps) {
  const router = useRouter()
  const [auditUrl, setAuditUrl] = useState('')
  const [auditError] = useState('')

  function handleAuditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push('/auth/signup')
  }

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden bg-background pt-[4.75rem] sm:pt-24">
      <HeroBrandAurora className="z-[1]" />

      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="rgba(59, 130, 246, 0.55)" />

      {/* Brand blue radial, lifted high so the lower half fades out above the screenshot bottom */}
      <div
        className="pointer-events-none absolute left-0 z-[1] opacity-45 [height:32%] [top:48%] filter blur-[40px] sm:[height:50%] sm:[top:38%] md:opacity-90 md:[height:60%] md:[top:28%] lg:[top:18%]"
        style={{
          width: '100vw',
          background:
            'radial-gradient(ellipse 70% 55% at center 55%, rgba(59, 130, 246, 0.24) 0%, rgba(124, 58, 237, 0.18) 18%, rgba(6, 182, 212, 0.12) 35%, rgba(29, 78, 216, 0.06) 48%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
        }}
        aria-hidden
      />

      {/* Subtle operator-grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 28%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 28%, black 0%, transparent 80%)',
        }}
        aria-hidden
      />

      <Particles
        className="absolute inset-0 z-[3]"
        quantity={42}
        ease={80}
        color="#a8b8c4"
        size={0.55}
        staticity={50}
      />
      <Particles
        className="absolute inset-0 z-[3]"
        quantity={32}
        ease={80}
        color="#93c5fd"
        size={0.45}
        staticity={52}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(42vh,480px)] bg-[linear-gradient(to_top,var(--background)_0%,var(--background)_8%,color-mix(in_oklch,var(--background)_88%,transparent)_18%,color-mix(in_oklch,var(--background)_40%,transparent)_38%,transparent_68%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-24 sm:px-8 sm:py-32 lg:py-36">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={itemVariants}>
            <Link
              href="/features"
              className="group inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-900 shadow-[0_10px_30px_-18px_rgba(59,130,246,0.65)] backdrop-blur-xl transition-colors hover:border-blue-500/45 hover:bg-white"
            >
              <span className="relative flex size-2 items-center justify-center">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-blue-500/60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-blue-500" />
              </span>
              <Sparkles className="size-3.5 text-blue-600" />
              My Company · Multitenant SaaS starter with Supabase &amp; Stripe
              <ArrowRight className="size-3.5 text-neutral-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
            <HeroAnimatedTitle />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Ship a production-ready multitenant SaaS with auth, team invites, Stripe billing, and Vercel deployment—without rebuilding the foundation.
          </motion.p>

          <motion.form
            variants={itemVariants}
            onSubmit={handleAuditSubmit}
            className="mx-auto mt-9 max-w-2xl rounded-2xl border border-line bg-background/85 p-3 text-left shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-sm font-semibold text-foreground">Start building on a proven stack</p>
              <span className="hidden rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
                Open source
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={auditUrl}
                onChange={(event) => setAuditUrl(event.target.value)}
                className="min-h-12 flex-1 rounded-xl border border-line bg-muted/40 px-4 text-base font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-500 focus:bg-background"
                placeholder="you@company.com"
                autoComplete="url"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Get started
                <ArrowRight className="ml-2 size-4" />
              </button>
            </div>
            {auditError ? <p className="mt-2 px-1 text-sm font-semibold text-red-600 dark:text-red-300">{auditError}</p> : null}
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
          >
            <HoverBorderGradient href={isSignedIn ? '/dashboard' : '/auth/signup'} duration={1.6}>
              {isSignedIn ? 'Open dashboard' : 'Start free'}
              <ArrowRight className="size-4" />
            </HoverBorderGradient>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-line-strong bg-background/60 px-7 py-3.5 text-[0.9375rem] font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/[0.04]"
            >
              See pricing
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground"
          >
            {['Supabase auth & RLS', 'Stripe subscriptions', 'Team workspaces'].map(
              (label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background/80 px-3 py-1 backdrop-blur"
                >
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  {label}
                </span>
              ),
            )}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          delay: 0.2,
          ease: [0.4, 0, 0.2, 1] as const,
        }}
        className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-28"
      >
        <div className="relative left-1/2 mt-8 w-[min(100%,92vw)] max-w-3xl -translate-x-1/2 sm:mt-12">
          {/* Clean product frame — glow is provided by the page-wide radial above, no local halo */}
          <div className="relative z-[2]">
            <HeroDashboardMockup />
          </div>

          {/* Long, soft fade to background */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[70%]"
            style={{
              background:
                'linear-gradient(to top, var(--background) 0%, var(--background) 18%, color-mix(in oklch, var(--background) 86%, transparent) 38%, color-mix(in oklch, var(--background) 60%, transparent) 58%, color-mix(in oklch, var(--background) 30%, transparent) 78%, transparent 100%)',
            }}
            aria-hidden
          />
        </div>
      </motion.div>
    </section>
  )
}
