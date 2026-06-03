import { cn } from '@/lib/utils'

/** Aurora mesh tuned to My Company blues / violet / cyan */
export function HeroBrandAurora({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 isolate overflow-hidden', className)}
      aria-hidden
    >
      <div className="absolute inset-0 [contain:layout_paint]">
        <div
          className={cn(
            'hero-supastripe-aurora absolute -left-[15%] -right-[15%] -top-[35%] h-[min(120%,920px)] sm:h-[min(110%,880px)]',
            'opacity-[0.38] motion-reduce:animate-none motion-reduce:opacity-[0.18] sm:opacity-[0.44] md:opacity-[0.48]',
            'blur-[44px] sm:blur-[56px] md:blur-[72px]',
          )}
        />
        <div
          className={cn(
            'hero-supastripe-aurora-delayed absolute -left-[20%] -right-[10%] top-[5%] h-[min(95%,720px)] sm:top-[8%]',
            'opacity-[0.22] motion-reduce:animate-none motion-reduce:opacity-[0.12] sm:opacity-[0.28] md:opacity-[0.32]',
            'blur-[36px] sm:blur-[48px] md:blur-[60px]',
          )}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/25 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,transparent_0%,var(--background)_72%)]" />
    </div>
  )
}
