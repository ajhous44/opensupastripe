'use client'

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import UserAvatar from '@/components/user/UserAvatar'
import { OrganizationProvider, useOrganization } from '@/lib/OrganizationContext'
import OrganizationSwitcher from '@/components/organization/OrganizationSwitcher'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

// Add touch event handlers for swipe

type NavItemProps = {
  href: string
  icon: ReactNode
  label: string
  tooltipDescription?: string
  disabled?: boolean
  onClick?: () => void
  pathname: string
  sidebarCollapsed: boolean
}

function NavItem({
  href,
  icon,
  label,
  tooltipDescription,
  disabled = false,
  onClick,
  pathname,
  sidebarCollapsed,
}: NavItemProps) {
  const isActive = pathname === href
  const linkHref = disabled ? "#" : href
  const [showTooltip, setShowTooltip] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const handleTooltipEnter = () => {
    if (sidebarCollapsed) {
      setShowTooltip(true)
    }

    if (sidebarCollapsed && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      })
    }
  }

  return (
    <Link
      href={linkHref}
      onClick={onClick}
      prefetch
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center mx-2 mb-1 rounded-xl transition-all duration-200 group relative ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : isActive
            ? 'border border-sky-400/35 bg-gradient-to-r from-sky-500/25 via-sky-400/12 to-blue-600/10 text-white shadow-lg backdrop-blur-md'
            : 'text-slate-300 hover:bg-white/5 hover:text-white hover:shadow-md'
      } ${sidebarCollapsed ? 'px-3 py-2.5 justify-center' : 'px-4 py-2.5'}`}
      onMouseEnter={handleTooltipEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        ref={iconRef}
        className={`flex-shrink-0 transition-all duration-200 ${
          isActive
            ? 'scale-110 text-sky-300'
            : 'text-slate-400 group-hover:scale-105 group-hover:text-white'
        } ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`}
      >
        {icon}
      </div>

      {!sidebarCollapsed ? (
        <span className={`font-medium transition-all duration-200 ${
          isActive ? 'text-white font-semibold' : 'group-hover:text-white'
        }`}>
          {label}
        </span>
      ) : null}

      {isActive ? (
        !sidebarCollapsed ? (
          <div className="ml-auto">
            <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]"></div>
          </div>
        ) : null
      ) : null}

      {sidebarCollapsed ? (
        showTooltip ? (
          <div
            className="fixed bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50 pointer-events-none border border-slate-600"
            style={{
              top: tooltipDescription ? tooltipPosition.top - 28 : tooltipPosition.top - 16,
              left: tooltipPosition.left,
            }}
          >
            <div className="font-semibold">{label}</div>
            {tooltipDescription ? (
              <div className="mt-0.5 max-w-52 text-xs font-normal text-slate-300">
                {tooltipDescription}
              </div>
            ) : null}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-600"></div>
          </div>
        ) : null
      ) : null}
    </Link>
  )
}

type BottomNavItemProps = {
  href: string
  icon: ReactNode
  label: string
  disabled?: boolean
  pathname: string
}

function BottomNavItem({
  href,
  icon,
  label,
  disabled = false,
  pathname,
}: BottomNavItemProps) {
  const isActive = pathname === href
  const linkHref = disabled ? "#" : href

  return (
    <Link
      href={linkHref}
      prefetch={false}
      aria-current={isActive ? 'page' : undefined}
      className={`flex flex-col items-center justify-center py-1 flex-1 border-t-2 ${
        isActive
          ? 'border-sky-400 text-sky-300'
          : 'border-transparent text-[#D8D9D4]'
      }`}
      style={{ touchAction: 'manipulation' }}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className="w-6 h-6 mb-1">
        {icon}
      </div>
      <span className="text-xs font-medium">
        {label}
      </span>
    </Link>
  )
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false

    try {
      const stored = window.localStorage.getItem('sidebarCollapsed')
      if (stored !== null) {
        document.documentElement.dataset.sidebarCollapsed = stored
        return stored === 'true'
      }
    } catch {
      // Keep default when localStorage is unavailable.
    }

    return document.documentElement.dataset.sidebarCollapsed === 'true'
  })
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ctx = useOrganization()
  const { hasOrganization, loading, userRole } = ctx

  // Handle clicks outside the account menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false)
      }
      
      // Close mobile sidebar when clicking outside
      if (isMobileView && showMobileSidebar && sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node)) {
        setShowMobileSidebar(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileView, showMobileSidebar])
  
  // Handle touch events for swipe - (Commented out to fix double tap on iOS, may re-introduce later)
  /*
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchDown = e.touches[0];
    setTouchPosition({
      startX: touchDown.clientX,
      startY: touchDown.clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchPosition) return;
    
    const touchDown = e.touches[0];
    const currentX = touchDown.clientX;
    const currentY = touchDown.clientY;
    
    const diffX = touchPosition.startX - currentX;
    const diffY = touchPosition.startY - currentY;
    
    // Check if horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Swipe left (positive diffX) - close sidebar
      if (diffX > 50 && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
      
      // Swipe right (negative diffX) - open sidebar
      if (diffX < -50 && !showMobileSidebar) {
        setShowMobileSidebar(true);
      }
    }
    
    setTouchPosition(null);
  };
  */

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }
  
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.sidebarCollapsed = String(newState)
    }
  }
  
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <>
      <div 
        className="flex h-screen bg-slate-50"
        // onTouchStart={handleTouchStart} // Temporarily commented out for testing iOS double-tap
        // onTouchMove={handleTouchMove} // Temporarily commented out for testing iOS double-tap
      >
        {/* Mobile Sidebar Overlay */}
        {isMobileView ? (
          showMobileSidebar ? (
            <button
              type="button"
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Close sidebar"
            />
          ) : null
        ) : null}
        
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={`bg-[#161616] border-r border-[#2a2a2a] flex flex-col transition-all duration-300 ease-in-out z-50 ${
            sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'
          } ${
            isMobileView ? 
            `fixed top-0 bottom-0 left-0 h-full shadow-2xl ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}` : 
            'relative shadow-xl'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#38bdf8 #1e293b',
          }}
        >
          {/* Custom scrollbar styles for webkit browsers */}
          <style dangerouslySetInnerHTML={{__html: `
            .sidebar-content::-webkit-scrollbar {
              width: 6px;
            }
            .sidebar-content::-webkit-scrollbar-track {
              background: #1e293b;
              border-radius: 3px;
            }
            .sidebar-content::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #0ea5e9, #38bdf8);
              border-radius: 3px;
            }
            .sidebar-content::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #0284c7, #0ea5e9);
            }
          `}} />
          
          {/* Top section - Logo and toggle */}
          <div className="p-4 flex items-center justify-between border-b border-[#2a2a2a] bg-transparent flex-shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center">
                <div className="relative">
                  <Image 
                    src="/logo.svg" 
                    alt="My Company Logo" 
                    width={32} 
                    height={32}
                    className="mr-3" 
                  />
                  <div className="absolute -inset-1 rounded-full bg-sky-400/25 opacity-75 blur" />
                </div>
                <div>
                  <span
                    className="bg-clip-text text-xl font-black text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #7dd3fc 0%, #38bdf8 40%, #e0f2fe 100%)',
                    }}
                  >
                    My Company
                  </span>
                </div>
              </div>
            ) : null}
            {sidebarCollapsed ? (
              <div className="w-full flex justify-center">
                <div className="relative">
                  <Image 
                    src="/logo.svg" 
                    alt="My Company Logo" 
                    width={32} 
                    height={32}
                  />
                  <div className="absolute -inset-1 rounded-full bg-sky-400/25 opacity-75 blur" />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 group ${isMobileView ? 'hidden' : ''}`}
            >
              {sidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
            {isMobileView ? (
              <button
                type="button"
                onClick={() => setShowMobileSidebar(false)}
                aria-label="Close sidebar"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>

          {/* Organization switcher */}
          {!sidebarCollapsed ? <OrganizationSwitcher /> : null}

          {/* Navigation */}
          <div className="flex-grow flex flex-col overflow-y-auto px-2 py-4 space-y-6 sidebar-content">
            {/* Main section */}
            <div>
              {!sidebarCollapsed ? (
                <div className="px-4 mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Dashboard
                </div>
              ) : null}
              
              <NavItem 
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
                href="/dashboard" 
                label="Overview"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              />
              
              <NavItem 
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
                href="/dashboard/team" 
                label="Team"
                disabled={!hasOrganization}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />

              <NavItem 
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
                href="/dashboard/profile" 
                label="Profile"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>
            
            {/* Resources section */}
            <div>
              {!sidebarCollapsed ? (
                <div className="px-4 mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Billing
                </div>
              ) : null}
              
              {userRole === 'owner' || userRole === 'admin' ? (
                <NavItem 
                  pathname={pathname}
                  sidebarCollapsed={sidebarCollapsed}
                  href="/dashboard/manage-subscription"
                  label="Manage Subscription"
                  disabled={!hasOrganization}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                />
              ) : null}
            </div>
          </div>
          
          {/* User account section */}
          <div className="relative mt-auto flex-shrink-0 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/20" ref={accountMenuRef}>
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center p-4 text-left transition-all duration-200 group ${
                accountMenuOpen ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
              }`}
              style={{ touchAction: 'manipulation' }}
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-expanded={accountMenuOpen}
              aria-label="Account menu"
            >
              <div className="relative">
                <UserAvatar size="sm" className="flex-shrink-0 ring-2 ring-slate-600/50" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></div>
              </div>
              
              {!sidebarCollapsed ? (
                <>
                  <div className="ml-3 flex-grow overflow-hidden">
                    <div className="text-sm font-semibold text-white">My Account</div>
                    <div className="text-xs text-slate-400">Manage settings</div>
                  </div>
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </>
              ) : null}
            </button>
              
            {/* Account popup menu */}
            {accountMenuOpen ? (
              <div className="absolute bottom-full left-0 z-10 mb-2 w-72 rounded-xl border border-slate-700/50 bg-slate-800 py-2 shadow-2xl backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <div className="text-sm font-semibold text-white">Account Settings</div>
                    <div className="text-xs text-slate-400">Manage your profile and preferences</div>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 group"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <div className="font-medium">Profile Settings</div>
                        <div className="text-xs text-slate-500">Update your information</div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="py-2 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <div>
                        <div className="font-medium">Sign Out</div>
                        <div className="text-xs text-slate-500">End your session</div>
                      </div>
                    </button>
                  </div>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden z-10 ${isMobileView ? 'w-full pb-16' : ''}`}>
          {/* Mobile menu toggle button */}
          {isMobileView ? (
            !showMobileSidebar ? (
              <button
                type="button"
                className="fixed top-4 left-4 z-50 bg-white p-3 rounded-md shadow-md"
                style={{ touchAction: 'manipulation' }}
                onClick={toggleMobileSidebar}
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : null
          ) : null}
        
          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse h-8 w-48 bg-gray-300 rounded mb-6"></div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
          
          {/* Mobile Bottom Navigation - Only on mobile */}
          {isMobileView ? (
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#161616] border-t border-[#2a2a2a] flex justify-around items-center px-2 z-40">
              <BottomNavItem 
                pathname={pathname}
                href="/dashboard" 
                label="Dashboard"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              />
              
              <BottomNavItem 
                pathname={pathname}
                href="/dashboard/team" 
                label="Team"
                disabled={!hasOrganization}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              
              {userRole === 'owner' || userRole === 'admin' ? (
                <BottomNavItem 
                  pathname={pathname}
                  href="/dashboard/manage-subscription" 
                  label="Billing"
                  disabled={!hasOrganization}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                />
              ) : null}
              
              <BottomNavItem 
                pathname={pathname}
                href="/dashboard/profile" 
                label="Profile"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>
          ) : null}
        </div>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </>
  )
} 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <InnerLayout>{children}</InnerLayout>
    </OrganizationProvider>
  )
}
