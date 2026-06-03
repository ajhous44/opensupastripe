/**
 * Shared dark hero shell for /integrations hub and per-integration pages.
 */
export function IntegrationsMarketingHero({ children }: { children: React.ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden pt-28 pb-16 md:pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90 [background-image:radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(6,182,212,0.35),transparent),linear-gradient(to_bottom,rgba(15,23,42,0.2),rgb(2,6,23))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />
      <div
        className="absolute left-[max(0px,calc(50%-38rem))] top-0 -z-10 h-64 w-[40rem] rounded-full bg-cyan-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute right-0 bottom-0 -z-10 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl md:h-96 md:w-96"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">{children}</div>
    </header>
  )
}
