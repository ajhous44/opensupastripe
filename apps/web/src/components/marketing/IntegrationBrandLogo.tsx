import type { IntegrationSlug } from '@/lib/marketing/platform-integration-pages'

export function integrationFaviconUrl(hostname: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`
}

export function IntegrationBrandLogo({
  platform,
  alt,
  decorative = false,
  className = 'h-10 w-10 shrink-0',
}: {
  platform: IntegrationSlug
  alt: string
  decorative?: boolean
  className?: string
}) {
  const logos = {
    stripe: { label: 'S', className: 'bg-[#635bff] text-white' },
    supabase: { label: 'S', className: 'bg-[#3ecf8e] text-emerald-950' },
    vercel: { label: 'V', className: 'bg-black text-white dark:bg-white dark:text-black' },
  } as const

  const logo = logos[platform]

  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-xl text-sm font-bold shadow-sm ${logo.className}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : alt}
    >
      {logo.label}
    </span>
  )
}
