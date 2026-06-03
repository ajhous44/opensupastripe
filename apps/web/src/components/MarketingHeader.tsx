'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { User } from '@supabase/supabase-js'
import { useTheme } from 'next-themes'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { INTEGRATION_PAGES, INTEGRATION_SLUGS } from '@/lib/marketing/platform-integration-pages'
import { FEATURE_PAGES, FEATURE_SLUGS } from '@/lib/marketing/platform-feature-pages'

const MARKETING_LINKS = [
  {
    href: '/features',
    title: 'Platform features',
    description: 'Multitenant workspaces, teams, and billing',
  },
  {
    href: '/pricing',
    title: 'Pricing',
    description: 'Free and Pro plans for growing teams',
  },
]

const TOOLS_LINKS = [
  {
    href: '/demo',
    title: 'Live demo',
    description: 'Explore the dashboard experience',
  },
  {
    href: '/contact',
    title: 'Contact',
    description: 'Talk to our team',
  },
  {
    href: '/about',
    title: 'About',
    description: 'Why we built this starter',
  },
]

const INTEGRATIONS_LINKS = [
  {
    href: '/integrations',
    title: 'All integrations',
    description: 'Stripe, Supabase, and Vercel',
  },
  ...INTEGRATION_SLUGS.map((slug) => ({
    href: `/integrations/${slug}`,
    title: INTEGRATION_PAGES[slug].navTitle,
    description: INTEGRATION_PAGES[slug].categoryLabel,
  })),
]

/** Desktop mega menu: overview + every feature spoke (mobile uses hub link only). */
const FEATURES_MEGA_LINKS = FEATURE_SLUGS.map((slug) => ({
  href: `/features/${slug}`,
  title: FEATURE_PAGES[slug].navTitle,
  description: FEATURE_PAGES[slug].categoryLabel,
}))

export default function MarketingHeader({ initialUser }: { initialUser?: User | null } = {}) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(initialUser === undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [marketingOpen, setMarketingOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  /** Mobile flyout: collapsible groups (desktop nav unchanged) */
  const [mobileMarketingExpanded, setMobileMarketingExpanded] = useState(false)
  const [mobileIntegrationsExpanded, setMobileIntegrationsExpanded] = useState(false)
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(initialUser !== undefined)
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const marketingRef = useRef<HTMLDivElement>(null)
  const integrationsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Check if the user is logged in (skip if server already provided auth state)
  useEffect(() => {
    if (initialUser !== undefined) {
      return
    }

    async function checkSession() {
      try {
        const supabase = createClient()
        const { data: { user }, error: _error } = await supabase.auth.getUser()
        if (!_error) {
          setUser(user)
        }
      } catch (_error) {
        // Silently handle auth errors - user is simply not logged in
      } finally {
        setLoading(false)
        setMounted(true)
      }
    }

    checkSession()
  }, [initialUser])

  // Handle scroll to change header style
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Initial check
    handleScroll()

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  // Handle click outside to close dropdown (only for mobile or when clicked)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        dropdownContainerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    // Close dropdown when pressing escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dropdownOpen) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [dropdownOpen])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileMarketingExpanded(false)
    setMobileIntegrationsExpanded(false)
    setMobileToolsExpanded(false)
  }

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) {
      closeMobileMenu()
      return
    }

    setMobileMenuOpen(true)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <header className={`fixed w-full top-0 z-40 transition-all duration-300`}>
      {/* Container with top margin - full width */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-4">
        <div className={`transition-all duration-300 ease-in-out ${scrolled
          ? 'bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-white/5'
          : 'bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-lg border border-transparent'
          }`}>
          {/* Desktop Layout */}
          <div className="px-6 lg:px-8 xl:px-12 py-2 hidden xl:grid xl:grid-cols-3 xl:items-center">
            {/* Left: Logo */}
            <div className="relative z-10 flex min-w-0 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.svg"
                  alt="My Company Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <div className="flex items-start">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">My Company</div>

                </div>
              </Link>
            </div>

            {/* Center: Navigation — min-w-0 + higher z-index so overflow links (e.g. Blog) stay above the auth column hit-area */}
            <div className="relative z-30 flex min-w-0 justify-center">
              <nav className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 xl:flex-nowrap xl:gap-x-5">
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                Pricing
              </Link>
              {/* Features mega menu (desktop) — mobile: single link to /features */}
              <div
                className="relative"
                ref={featuresRef}
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                  aria-expanded={featuresOpen}
                  aria-haspopup="true"
                >
                  Features
                  <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute left-0 right-0 h-2 top-full" />
                <div
                  className={`absolute left-1/2 z-50 mt-2 w-[min(calc(100vw-2rem),44rem)] origin-top rounded-xl bg-white/[0.98] py-2 shadow-xl ring-1 ring-black/5 backdrop-blur-lg transition-all duration-200 dark:bg-black/[0.98] dark:ring-white/10 ${
                    featuresOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                  } -translate-x-1/2`}
                >
                  <div className="max-h-[min(70vh,26rem)] overflow-y-auto px-2 pb-2 pt-1">
                    <Link
                      href="/features"
                      className="mb-2 block rounded-lg border border-indigo-200/80 bg-indigo-50/95 px-3 py-2.5 transition hover:bg-indigo-100/95 dark:border-indigo-500/25 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">All features</span>
                      <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                        Platform overview &amp; capability hub
                      </span>
                    </Link>
                    <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3">
                      {FEATURES_MEGA_LINKS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                          <span className="font-medium leading-snug">{item.title}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                            {item.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Marketing Dropdown */}
              <div
                className="relative"
                ref={marketingRef}
                onMouseEnter={() => setMarketingOpen(true)}
                onMouseLeave={() => setMarketingOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                  aria-expanded={marketingOpen}
                  aria-haspopup="true"
                >
                  Marketing
                  <ChevronDown className={`w-4 h-4 transition-transform ${marketingOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute left-0 right-0 h-2 top-full" />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl shadow-xl py-2 bg-white/[0.98] dark:bg-black/[0.98] backdrop-blur-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 origin-top ${
                    marketingOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {MARKETING_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Integrations Dropdown */}
              <div
                className="relative"
                ref={integrationsRef}
                onMouseEnter={() => setIntegrationsOpen(true)}
                onMouseLeave={() => setIntegrationsOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                  aria-expanded={integrationsOpen}
                  aria-haspopup="true"
                >
                  Integrations
                  <ChevronDown className={`w-4 h-4 transition-transform ${integrationsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute left-0 right-0 h-2 top-full" />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 max-h-[min(70vh,28rem)] w-72 overflow-y-auto rounded-xl shadow-xl py-2 bg-white/[0.98] dark:bg-black/[0.98] backdrop-blur-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 origin-top ${
                    integrationsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {INTEGRATIONS_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Tools Dropdown */}
              <div
                className="relative"
                ref={toolsRef}
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button type="button" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Tools
                  <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute left-0 right-0 h-2 top-full" />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl shadow-xl py-2 bg-white/[0.98] dark:bg-black/[0.98] backdrop-blur-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 origin-top ${
                    toolsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {TOOLS_LINKS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                    >
                      <span className="font-medium">{tool.title}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{tool.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                Blog
              </Link>
              </nav>
            </div>

            {/* Right: Auth actions */}
            <div className="relative z-20 flex min-w-0 items-center justify-end gap-4">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {mounted && (theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                ))}
              </button>

              {loading ? (
                <div className="h-10 w-16 rounded-lg bg-white/10 animate-pulse"></div>
              ) : user ? (
                <div
                  className="relative group"
                  ref={dropdownContainerRef}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-full hover:from-indigo-600 hover:to-purple-600 text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center cursor-pointer"
                  >
                    Dashboard
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </Link>
                  <div className="absolute left-0 right-0 h-3 top-full"></div>
                  <div
                    ref={dropdownRef}
                    className={`absolute right-0 mt-3 w-48 rounded-2xl shadow-xl py-2 bg-white/[0.98] dark:bg-black/[0.98] backdrop-blur-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 origin-top-right ${dropdownOpen
                      ? 'transform opacity-100 scale-100'
                      : 'transform opacity-0 scale-95 pointer-events-none'
                      }`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1">Dashboard</Link>
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1">Profile</Link>
                    <button type="button" onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer rounded-lg mx-1">Sign Out</button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">Login</Link>
                  <Link href="/auth/signup" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-full hover:from-indigo-600 hover:to-purple-600 text-sm font-medium transition-all shadow-md hover:shadow-lg">Get Started</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="px-6 lg:px-8 xl:px-12 py-2 flex xl:hidden items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="My Company Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <div className="flex items-start">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">My Company</div>

              </div>
            </Link>

            {/* Mobile menu button */}
            <div className="ml-auto">
              <button
                type="button"
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none transition-colors"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu — scrollable panel; Marketing / Integrations / Tools are collapsible */}
      {mobileMenuOpen && (
        <div className="xl:hidden mx-4 mt-2 max-h-[min(85dvh,calc(100dvh-5.5rem))] overflow-y-auto overscroll-contain">
          <div className="bg-white/[0.98] dark:bg-black/[0.98] backdrop-blur-xl rounded-2xl shadow-xl px-2 pt-2 pb-3 space-y-0.5 border border-gray-200/50 dark:border-transparent">
            <Link href="/about" className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={closeMobileMenu}>About</Link>
            <Link href="/pricing" className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={closeMobileMenu}>Pricing</Link>
            <Link href="/features" className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={closeMobileMenu}>Features</Link>

            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left"
              aria-expanded={mobileMarketingExpanded}
              onClick={() => setMobileMarketingExpanded((v) => !v)}
            >
              Marketing
              <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${mobileMarketingExpanded ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {mobileMarketingExpanded ? (
              <div className="ml-2 border-l border-gray-200 pl-2 dark:border-white/10">
                {MARKETING_LINKS.map((item) => (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="block">{item.title}</span>
                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{item.description}</span>
                  </Link>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left"
              aria-expanded={mobileIntegrationsExpanded}
              onClick={() => setMobileIntegrationsExpanded((v) => !v)}
            >
              Integrations
              <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${mobileIntegrationsExpanded ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {mobileIntegrationsExpanded ? (
              <div className="ml-2 border-l border-gray-200 pl-2 dark:border-white/10">
                {INTEGRATIONS_LINKS.map((item) => (
                  <Link
                    key={`mobile-int-${item.href}`}
                    href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="block">{item.title}</span>
                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{item.description}</span>
                  </Link>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left"
              aria-expanded={mobileToolsExpanded}
              onClick={() => setMobileToolsExpanded((v) => !v)}
            >
              Tools
              <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${mobileToolsExpanded ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {mobileToolsExpanded ? (
              <div className="ml-2 border-l border-gray-200 pl-2 dark:border-white/10">
                {TOOLS_LINKS.map((tool) => (
                  <Link
                    key={`mobile-${tool.href}`}
                    href={tool.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="block">{tool.title}</span>
                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{tool.description}</span>
                  </Link>
                ))}
              </div>
            ) : null}

            <Link href="/blog" className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={closeMobileMenu}>Blog</Link>

            {loading ? (
              <div className="h-10 mx-3 rounded-lg bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 rounded-xl text-base font-medium bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all mx-1"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
} 
