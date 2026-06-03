'use client'

import { LayoutTextFlip } from '@/components/ui/layout-text-flip'

const titleClass = [
  'brand-font',
  'font-semibold',
  'leading-[1.02]',
  'tracking-[-0.04em]',
  'text-foreground',
  'text-[2.75rem]',
  'sm:text-[3rem]',
  'md:text-[3.5rem]',
  'lg:text-[4rem]',
  'xl:text-[4.5rem]',
].join(' ')

export function HeroAnimatedTitle() {
  return (
    <h1 className={`${titleClass} mt-6 text-center`}>
      <span className="block">Your organization&rsquo;s AI</span>
      <LayoutTextFlip
        className="mt-1 flex flex-wrap items-baseline justify-center gap-x-0"
        text=""
        words={[
          'SaaS starter.',
          'billing stack.',
          'team hub.',
          'tenant router.',
          'auth layer.',
        ]}
        duration={2600}
        staticClassName={titleClass}
        flipWrapperClassName={titleClass}
      />
    </h1>
  )
}
