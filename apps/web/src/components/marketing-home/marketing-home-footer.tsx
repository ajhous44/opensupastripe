import Link from 'next/link'

type FooterLink = { label: string; href: string }

const productLinks: readonly FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Demo', href: '/demo' },
]

const legalLinks: readonly FooterLink[] = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingHomeFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="brand-font text-sm font-semibold text-foreground">My Company</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Multitenant SaaS starter with Supabase, Stripe, and Vercel — auth, billing, and teams built in.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} My Company. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly FooterLink[]
}) {
  return (
    <nav className="flex flex-col gap-2 text-sm text-muted-foreground" aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">{title}</p>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
