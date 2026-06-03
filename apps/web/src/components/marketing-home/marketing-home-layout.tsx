import type { ReactNode } from 'react'
import { MarketingHomeFooter } from '@/components/marketing-home/marketing-home-footer'
import MarketingHeaderWrapper from '@/components/MarketingHeaderWrapper'

type MarketingHomeLayoutProps = {
  children: ReactNode
  initialUser?: unknown
}

/** Markio-style marketing chrome: floating pill nav, scrollable body, compact footer */
export function MarketingHomeLayout({ children }: MarketingHomeLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <MarketingHeaderWrapper />
      <div className="flex flex-1 flex-col">{children}</div>
      <MarketingHomeFooter />
    </main>
  )
}
