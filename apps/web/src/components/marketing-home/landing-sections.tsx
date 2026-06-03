import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Gauge, Search } from 'lucide-react'

import { FaqAccordion, type FaqItem } from '@/components/marketing-home/faq-accordion'
import {
  ConnectStepIcon,
  PrioritizeStepIcon,
  ShipStepIcon,
} from '@/components/marketing-home/feature-icons'
import IntegrationBeam from '@/components/landing/IntegrationBeam'
import BentoDemo from '@/components/landing/BentoDemo'
import { GlowingCard } from '@/components/ui/glowing-card'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { TracingBeam } from '@/components/ui/tracing-beam'

const integrationItems = [
  'Supabase Auth',
  'Stripe Billing',
  'Vercel Deploy',
  'Team Invites',
  'Custom Domains',
  'Row Level Security',
  'Organization Switcher',
  'Subscription Portal',
  'Webhook Handlers',
  'Multitenant Routing',
].map((name) => ({
  id: name,
  node: (
    <div className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-background/80 px-5 backdrop-blur">
      <span className="size-2 rounded-full bg-blue-500/70" />
      <span className="mono text-[13px] font-medium tracking-tight text-foreground/80">{name}</span>
    </div>
  ),
}))

const workflowStages = [
  {
    tag: '01 · SET UP',
    title: 'Create your organization workspace in minutes.',
    body:
      'Add your organization name, subdomain, and team details. Invite collaborators and connect Stripe when you are ready to bill customers.',
    icon: ConnectStepIcon,
    panel: (
      <div className="rounded-2xl border border-line bg-background/80 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.55)]">
        <span className="mono inline-flex rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
          Starter setup
        </span>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            { k: 'Organization', v: 'Created' },
            { k: 'Subdomain', v: 'Live' },
            { k: 'Team invites', v: 'Sent' },
            { k: 'Billing', v: 'Ready' },
          ].map((row) => (
            <div key={row.k} className="rounded-xl border border-line bg-muted/30 px-3 py-2">
              <p className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{row.k}</p>
              <p className="mt-1 text-[12px] font-medium text-foreground">{row.v}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: '02 · COLLABORATE',
    title: 'Invite teammates with role-based access.',
    body:
      'Owners, admins, and staff get the right dashboard access. Accept-invite flows and organization switching keep multitenant teams organized.',
    icon: PrioritizeStepIcon,
    panel: (
      <div className="rounded-2xl border border-line bg-background/80 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.55)]">
        <div className="flex items-center justify-between">
          <span className="mono inline-flex rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Role checklist
          </span>
          <span className="mono text-[10px] text-muted-foreground">Built for growing teams</span>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { score: '1', label: 'Invite admins and staff to your workspace', lift: 'Team' },
            { score: '2', label: 'Assign owner, admin, or staff roles', lift: 'RBAC' },
            { score: '3', label: 'Accept invites via secure email links', lift: 'Auth' },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 rounded-xl border border-line bg-muted/30 px-3 py-2">
              <span className="mono rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                {row.score}
              </span>
              <span className="flex-1 truncate text-[12px] text-foreground/85">{row.label}</span>
              <span className="mono text-[10px] font-semibold text-blue-700">{row.lift}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: '03 · SHIP',
    title: 'Deploy, bill customers, and scale when ready.',
    body:
      'Connect Stripe for subscriptions, wire webhooks to Supabase, and deploy on Vercel. Start on a free subdomain; add custom domains and priority support on Pro.',
    icon: ShipStepIcon,
    panel: (
      <div className="rounded-2xl border border-line bg-background/80 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.55)]">
        <div className="flex items-center justify-between">
          <span className="mono inline-flex rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Production stack
          </span>
          <span className="mono text-[10px] text-muted-foreground">Upgrade path included</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            { k: 'Subdomain', v: 'Live' },
            { k: 'Stripe billing', v: 'Connected' },
            { k: 'Webhooks', v: 'Synced' },
            { k: 'Custom domain', v: 'Optional' },
          ].map((row) => (
            <div key={row.k} className="rounded-xl border border-line bg-muted/30 px-3 py-2">
              <p className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{row.k}</p>
              <p className="brand-font mt-1 text-lg font-semibold text-foreground">{row.v}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
] as const

const impactStats = [
  {
    label: 'Start with',
    value: 'Org + auth',
    caption: 'Create a workspace, provision a subdomain, and invite your first teammates.',
    Icon: Search,
  },
  {
    label: 'Ship with',
    value: 'Stripe + RLS',
    caption: 'Subscriptions, webhooks, and row-level security keep tenants isolated.',
    Icon: FileText,
  },
  {
    label: 'Deploy on',
    value: 'Vercel',
    caption: 'Preview URLs, environment variables, and production-ready Next.js App Router.',
    Icon: BarChart3,
  },
  {
    label: 'Starts at',
    value: '$0/mo',
    caption: 'Start free, then upgrade when you need custom domains and priority support.',
    Icon: Gauge,
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    audience: 'Best for evaluating the stack and launching your first workspace.',
    highlighted: false,
    ctaLabel: 'Start free',
    href: '/auth/signup',
    features: ['1 organization', 'Subdomain hosting', 'Team invites', 'Supabase auth & RLS', 'Basic support'],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    badge: 'Most popular',
    audience: 'Best for teams that need custom domains and Stripe billing at scale.',
    highlighted: true,
    ctaLabel: 'Choose Pro',
    href: '/pricing',
    features: ['Custom domain', 'Stripe subscriptions', 'Priority support', 'Higher usage limits', 'Everything in Starter'],
  },
  {
    name: 'Enterprise',
    price: 'Talk to us',
    audience: 'Best for multi-workspace deployments and custom onboarding.',
    highlighted: false,
    ctaLabel: 'Contact us',
    href: '/contact',
    features: ['Multiple organizations', 'Custom onboarding', 'Dedicated support', 'SLA options', 'Concierge setup'],
  },
]

export const homeFaqs: FaqItem[] = [
  {
    question: 'Is My Company really free?',
    answer: 'Yes. The Starter plan is free forever for one workspace. No credit card required.',
  },
  {
    question: 'What do I get on the Starter plan?',
    answer:
      'One organization, subdomain hosting (yourorg.localhost:3000), Supabase auth, team invites, and the full dashboard shell.',
  },
  {
    question: 'What’s included on the Pro plan?',
    answer:
      'Custom domain support, Stripe subscription billing, priority support, and higher usage limits.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Yes. Custom domains are supported on Pro with DNS verification.',
  },
  {
    question: 'How quickly can we go live?',
    answer:
      'Your subdomain is provisioned during signup. Most teams can create an organization and invite teammates the same day.',
  },
  {
    question: 'Do I need technical skills?',
    answer:
      'Basic familiarity with Supabase and Stripe helps, but the starter includes migrations, env examples, and guided setup.',
  },
  {
    question: 'Is this a blank-canvas website builder?',
    answer:
      'No. This is an opinionated SaaS starter—auth, billing, teams, and multitenant routing are built in so you can focus on your product.',
  },
  {
    question: 'Does this include Stripe billing?',
    answer:
      'Yes. Checkout, webhooks, subscription plans, and a manage-subscription dashboard are included out of the box.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Start free and upgrade when you need to. There are no long-term contracts.',
  },
  {
    question: 'Do I keep ownership of my data?',
    answer: 'Yes. Your organization data lives in your Supabase project.',
  },
  {
    question: 'Is support available?',
    answer: 'Yes. We provide support to help you get set up and stay successful.',
  },
]

export function LandingSections() {
  return (
    <>
      <section className="border-t border-line bg-gradient-to-b from-background via-background to-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="mono text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Connects Supabase auth, Stripe billing, team invites, and Vercel deployment
          </p>
          <div className="mt-8">
            <InfiniteMovingCards items={integrationItems} speed="slow" />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="relative mx-auto max-w-5xl px-5 py-28 sm:px-8 sm:py-36">
          <div className="pointer-events-none absolute -left-20 top-20 size-60 rounded-full bg-blue-500/[0.12] blur-3xl" />
          <p className="section-label">Why teams choose My Company</p>
          <h2 className="brand-font mt-6 max-w-[22ch] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem]">
            <TextGenerateEffect
              words="Greenfield SaaS means rebuilding auth, billing, and multitenant routing. My Company ships those foundations so you can focus on your product—not plumbing."
              accentWords={['auth', 'billing', 'multitenant', 'routing', 'foundations', 'product', 'plumbing']}
              accentClassName="text-blue-600"
              duration={0.55}
            />
          </h2>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            My Company is opinionated on purpose: organizations as tenants, Stripe-native subscriptions, SSR auth with
            RLS, and a dashboard shell that matches production patterns. Less boilerplate, fewer integration chores,
            and more time shipping features your customers pay for.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line border-x border-line sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {impactStats.map(({ label, value, caption, Icon }) => (
            <div key={label} className="px-6 py-10 sm:px-8 sm:py-12">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-blue-600" aria-hidden />
                <p className="mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </p>
              </div>
              <p className="brand-font mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{caption}</p>
            </div>
          ))}
        </div>
      </section>

      <IntegrationBeam />

      <section id="product" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-4 py-2">
            <span className="mono text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              Platform features
            </span>
          </div>
          <h2 className="brand-font mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
            Everything you need to launch SaaS
          </h2>
        </div>

        <BentoDemo />
      </section>

      <section id="how" className="border-t border-line bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="max-w-2xl">
            <p className="section-label">The loop</p>
            <h2 className="brand-font mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
              From workspace setup
              <span className="text-muted-foreground"> to production billing, in three stages.</span>
            </h2>
          </div>

          <TracingBeam className="mt-16 max-w-3xl pl-6 md:pl-0">
            <div className="space-y-16 md:pl-16">
              {workflowStages.map((stage) => (
                <article key={stage.tag} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="mono rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-blue-700">
                      {stage.tag}
                    </span>
                  </div>
                  <h3 className="brand-font mt-5 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
                    {stage.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{stage.body}</p>
                  <div className="mt-6">{stage.panel}</div>
                </article>
              ))}
            </div>
          </TracingBeam>
        </div>
      </section>

      <section id="pricing" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-lg">
              <p className="section-label">Pricing</p>
              <h2 className="brand-font mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
                Start free.
                <span className="text-muted-foreground"> Scale when your team grows.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Keep the entry plan simple, then unlock custom domains, Stripe billing, and priority support when
                your product is ready.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Full plan comparison
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <GlowingCard
                key={plan.name}
                glowColor={plan.highlighted ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.22)'}
                className={plan.highlighted ? 'border-blue-500/25 bg-gray-950 text-white dark:bg-white dark:text-black' : undefined}
              >
                <article className={`flex h-full flex-col p-8 sm:p-10 ${plan.highlighted ? 'text-white dark:text-black' : 'text-foreground'}`}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.badge ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${plan.highlighted ? 'bg-white/15 text-white/80 dark:bg-black/10 dark:text-black/70' : 'bg-foreground/5 text-muted-foreground'}`}>
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="brand-font mt-4 text-4xl font-semibold tracking-tight">{plan.price}</p>
                  <p className={`mt-3 text-sm leading-relaxed ${plan.highlighted ? 'text-white/60 dark:text-black/60' : 'text-muted-foreground'}`}>
                    {plan.audience}
                  </p>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex gap-3 text-sm ${plan.highlighted ? 'text-white/75 dark:text-black/75' : 'text-foreground/80'}`}>
                        <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${plan.highlighted ? 'bg-blue-400' : 'bg-foreground/20'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10">
                    <Link
                      href={plan.href}
                      className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80 ${plan.highlighted ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-foreground text-background'}`}
                    >
                      {plan.ctaLabel}
                    </Link>
                  </div>
                </article>
              </GlowingCard>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-line bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-16">
            <div>
              <p className="section-label">FAQ</p>
              <h2 className="brand-font mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Quick answers to help you decide.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
              >
                Book a walkthrough
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <FaqAccordion items={homeFaqs} />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-background via-background to-blue-500/[0.08] p-10 shadow-[0_30px_80px_-60px_rgba(16,24,40,0.45)] sm:p-16">
            <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-blue-500/[0.22] blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-24 size-72 rounded-full bg-cyan-400/[0.14] blur-3xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.06) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
                maskImage: 'radial-gradient(ellipse 60% 80% at 80% 20%, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 80% 20%, black 0%, transparent 70%)',
              }}
              aria-hidden
            />
            <p className="section-label relative">Ready when you are</p>
            <h2 className="brand-font relative mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.5rem]">
              You already have the idea.
              <br />
              <span className="italic text-blue-600">Ship</span>{' '}
              <span className="text-muted-foreground">the SaaS foundation.</span>
            </h2>
            <p className="relative mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Spin up a multitenant workspace, wire Stripe billing, and deploy on Vercel in minutes. Start free,
              upgrade when you need custom domains and priority support.
            </p>
            <div className="relative mt-10 flex flex-col gap-4 sm:flex-row">
              <HoverBorderGradient
                href="/auth/signup"
                className="bg-gray-950 text-white dark:bg-white dark:text-black"
              >
                Start free
                <ArrowRight className="size-4" />
              </HoverBorderGradient>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-line-strong bg-background/60 px-7 py-3.5 text-[0.9375rem] font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/[0.04]"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
