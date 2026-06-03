import React from 'react'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  bgImage?: string // path to background image in /public
  overlayOpacity?: number // 0‑100 scale, default 60 (white/60)
}

/**
 * Section – reusable wrapper for marketing page sections.
 * – Provides max‑width container, vertical padding, and optional blurred overlay when `bgImage` passed.
 * – Keeps layout markup DRY and aligned with future SaaS style.
 */
export default function Section({
  as: Tag = 'section',
  bgImage,
  overlayOpacity = 60,
  className = '',
  children,
  ...props
}: SectionProps) {
  const overlayClass = `absolute inset-0 bg-white/${overlayOpacity} backdrop-blur-sm`

  return (
    <Tag
      className={`relative isolate py-20 sm:py-24 ${bgImage ? 'bg-cover bg-center' : ''} ${className}`}
      style={bgImage ? {
        backgroundImage: `url('${bgImage}')`,
      } : undefined}
      {...props}
    >
      {bgImage && <div className={overlayClass} />}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {children}
      </div>
    </Tag>
  )
} 