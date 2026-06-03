import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { FeaturesMarketingHero } from '@/components/marketing/FeaturesMarketingHero'
import { FeaturesLogoNav } from '@/components/marketing/FeaturesLogoNav'
import { BreadcrumbScript } from '@/lib/breadcrumb-jsonld'
import {
  FEATURE_SLUGS,
  getFeaturePage,
  featureCanonicalUrl,
} from '@/lib/marketing/platform-feature-pages'
import { ArrowRight, ExternalLink } from 'lucide-react'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = getFeaturePage(slug)
  if (!page) {
    return { title: 'Feature' }
  }
  const url = featureCanonicalUrl(slug)
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: page.ogTitle,
      description: page.metaDescription,
    },
  }
}

function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

function webPageJsonLd(slug: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: featureCanonicalUrl(slug),
    isPartOf: { '@type': 'WebSite', name: 'My Company', url: SITE },
    about: {
      '@type': 'SoftwareApplication',
      name: 'My Company',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    },
    dateModified: '2026-04-15',
  }
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params
  const page = getFeaturePage(slug)
  if (!page) notFound()

  const dashboardSecondary =
    page.slug === 'stripe-billing'
      ? { href: '/dashboard/manage-subscription' as const, label: 'Manage subscription' }
      : { href: '/dashboard' as const, label: 'Open dashboard' }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <BreadcrumbScript
        items={[
          { name: 'Features', path: '/features' },
          { name: page.navTitle, path: `/features/${page.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd(page.slug, page.h1, page.metaDescription)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(page.faq)),
        }}
      />

      <MarketingHeader />

      <FeaturesMarketingHero>
        <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/features" className="transition hover:text-indigo-300">
                Features
              </Link>
            </li>
            <li aria-hidden className="text-slate-600">
              /
            </li>
            <li className="text-slate-200">{page.navTitle}</li>
          </ol>
        </nav>

        <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-indigo-300/90">
          {page.categoryLabel}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3rem] lg:leading-[1.08]">
          {page.h1}
        </h1>
        <p
          className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl md:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.leadHtml }}
        />

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={dashboardSecondary.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            {dashboardSecondary.label}
            <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
          </Link>
        </div>
      </FeaturesMarketingHero>

      <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/40">
          <div className="relative aspect-[21/9] w-full max-h-72 md:max-h-80">
            <Image
              src={page.heroImage.src}
              alt={page.heroImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1152px"
              priority
            />
            {page.heroImage.credit ? (
              <p className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
                {page.heroImage.credit}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:pb-14">
        <article className="order-1 min-w-0 max-w-3xl flex-1 lg:order-2">
          <section aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              Highlights
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {page.highlights.map((h) => (
                <li
                  key={h.title}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{h.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{h.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="why-heading">
            <h2 id="why-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              Why it matters
            </h2>
            <div
              className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300 [&_strong]:text-slate-900 [&_strong]:dark:text-white"
              dangerouslySetInnerHTML={{ __html: page.benefitsHtml }}
            />
          </section>

          {page.valueProps.length > 0 ? (
            <section className="mt-10 space-y-4" aria-labelledby="value-heading">
              <h2 id="value-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
                Practical notes
              </h2>
              {page.valueProps.map((p, i) => (
                <p key={`val-${page.slug}-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
                  {p}
                </p>
              ))}
            </section>
          ) : null}

          <section className="mt-12" aria-labelledby="how-heading">
            <h2 id="how-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              How it works in My Company
            </h2>
            <ul className="mt-6 space-y-4 text-slate-700 dark:text-slate-300">
              {page.howItWorks.map((html, i) => (
                <li
                  key={`how-${page.slug}-${i}`}
                  className="leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900 [&_strong]:dark:text-white"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </ul>
          </section>

          {page.relatedLinks && page.relatedLinks.length > 0 ? (
            <aside
              className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-900/60"
              aria-labelledby="related-heading"
            >
              <h2 id="related-heading" className="text-base font-semibold text-slate-900 dark:text-white">
                Related
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {page.relatedLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-medium text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <section className="mt-14" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              FAQ
            </h2>
            <div className="mt-6 space-y-3">
              {page.faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-slate-200 bg-white open:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {item.question}
                      <span className="text-slate-400 transition group-open:rotate-180">▼</span>
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:text-slate-400">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </article>

        <FeaturesLogoNav activeSlug={page.slug} className="order-2 lg:order-1" />
      </div>

      <MarketingFooter />
    </div>
  )
}
