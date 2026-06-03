import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { IntegrationsMarketingHero } from '@/components/marketing/IntegrationsMarketingHero'
import { IntegrationsLogoNav } from '@/components/marketing/IntegrationsLogoNav'
import { BreadcrumbScript } from '@/lib/breadcrumb-jsonld'
import {
  INTEGRATION_SLUGS,
  INTEGRATIONS_DOCS_URL,
  getIntegrationPage,
  integrationCanonicalUrl,
} from '@/lib/marketing/platform-integration-pages'
import { ArrowRight, ExternalLink } from 'lucide-react'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

function FaqAnswerBody({ text }: { text: string }) {
  if (text.startsWith('https://')) {
    const dash = text.indexOf(' — ')
    if (dash > 0) {
      const url = text.slice(0, dash)
      const rest = text.slice(dash + 3)
      return (
        <>
          <a
            href={url}
            className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
            rel="noopener noreferrer"
          >
            {url}
          </a>
          {' — '}
          {rest}
        </>
      )
    }
    return (
      <a
        href={text}
        className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    )
  }
  return <>{text}</>
}

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return INTEGRATION_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = getIntegrationPage(slug)
  if (!page) {
    return { title: 'Integration' }
  }
  const url = integrationCanonicalUrl(slug)
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
    url: integrationCanonicalUrl(slug),
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

function faqAnswerForJsonLd(answer: string) {
  return answer
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params
  const page = getIntegrationPage(slug)
  if (!page) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <BreadcrumbScript
        items={[
          { name: 'Integrations', path: '/integrations' },
          { name: page.navTitle, path: `/integrations/${page.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd(page.slug, page.h1, page.metaDescription)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqJsonLd(
              page.faq.map((item) => ({
                question: item.question,
                answer: faqAnswerForJsonLd(item.answer),
              }))
            )
          ),
        }}
      />

      <MarketingHeader />

      <IntegrationsMarketingHero>
        <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/integrations" className="transition hover:text-cyan-300">
                Integrations
              </Link>
            </li>
            <li aria-hidden className="text-slate-600">
              /
            </li>
            <li className="text-slate-200">{page.navTitle}</li>
          </ol>
        </nav>

        <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300/90">
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
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/dashboard/distribution"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            Open Distribution
            <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
          </Link>
        </div>
      </IntegrationsMarketingHero>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 lg:flex-row lg:items-start lg:gap-12 lg:px-8">
        <article className="order-1 min-w-0 max-w-3xl flex-1 lg:order-2">
        <section aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
            Why connect {page.navTitle}?
          </h2>
          <div
            className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300 [&_strong]:text-slate-900 [&_strong]:dark:text-white"
            dangerouslySetInnerHTML={{ __html: page.benefitsHtml }}
          />
        </section>

        {page.valueProps.length > 0 ? (
          <section className="mt-10 space-y-4" aria-labelledby="value-heading">
            <h2 id="value-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              What this means for your product
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
            How it works
          </h2>
          <ul className="mt-6 space-y-4 text-slate-700 dark:text-slate-300">
            {page.howItWorks.map((html, i) => (
              <li
                key={`how-${page.slug}-${i}`}
                className="leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900 [&_strong]:dark:text-white [&_code]:text-cyan-800 dark:[&_code]:text-cyan-200"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-900/60" aria-labelledby="docs-heading">
          <h2 id="docs-heading" className="text-base font-semibold text-slate-900 dark:text-white">
            Technical setup &amp; reference
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Environment variables, webhook handlers, and setup checklists live in{' '}
            <a
              href={INTEGRATIONS_DOCS_URL}
              className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
              rel="noopener noreferrer"
            >
              My Company documentation
            </a>
            . See the README and `.env.example` in the repo for local development steps.
          </p>
        </aside>

        {page.specReferences && page.specReferences.length > 0 ? (
          <div className="mt-10 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-800 dark:text-slate-200">Partner documentation</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {page.specReferences.map((ref) => (
                <li key={ref.href}>
                  <a
                    href={ref.href}
                    className="font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400"
                    rel="noopener noreferrer"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-12" aria-labelledby="partner-heading">
          <h2 id="partner-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
            Partner-side setup
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">{page.partnerSetup}</p>
        </section>

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
                  <FaqAnswerBody text={item.answer} />
                </div>
              </details>
            ))}
          </div>
        </section>
      </article>

        <IntegrationsLogoNav activeSlug={page.slug} className="order-2 lg:order-1" />
      </div>

      <MarketingFooter />
    </div>
  )
}
