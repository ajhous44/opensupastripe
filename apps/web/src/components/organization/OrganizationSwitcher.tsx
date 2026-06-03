'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useOrganization } from '@/lib/OrganizationContext'
import { useRouter, usePathname } from 'next/navigation'

export default function OrganizationSwitcher() {
  const { organizations, currentOrganization, userRole, switchOrganization, loading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const isOnResourcePage = () => {
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    return uuidPattern.test(pathname)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-4 border-b border-[#2a2a2a] bg-transparent flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="ml-3">
            <div className="h-4 w-32 bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className="px-4 py-4 border-b border-[#2a2a2a] bg-transparent flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-slate-600/50">
            <span className="text-sm font-black text-slate-300">?</span>
          </div>
          <div className="ml-3">
            <div className="font-bold text-white text-base">Setup Required</div>
            <div className="text-slate-400 text-xs">Create organization</div>
          </div>
        </div>
      </div>
    )
  }

  const orgAvatar = currentOrganization.logo_url ? (
    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-600/50 shadow-lg bg-slate-700">
        <Image
          src={currentOrganization.logo_url}
          alt={`${currentOrganization.name} Logo`}
          width={40}
          height={40}
          className="w-full h-full object-contain bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    </div>
  ) : (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-[#2a2a2a] flex-shrink-0"
      style={{ backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #161616 100%)' }}
    >
      <span className="text-sm font-black text-white">{currentOrganization.name.charAt(0)}</span>
    </div>
  )

  const roleLabel = userRole === 'owner' ? 'Owner' : userRole === 'admin' ? 'Admin' : 'Staff'

  if (organizations.length === 1) {
    return (
      <div className="px-4 py-4 border-b border-[#2a2a2a] bg-transparent flex-shrink-0">
        <div className="flex items-center">
          {orgAvatar}
          <div className="ml-3 overflow-hidden flex-1 min-w-0">
            <div className="font-bold text-white text-base truncate">{currentOrganization.name}</div>
            <div className="text-slate-400 text-xs font-medium">{roleLabel}</div>
            <div className="flex items-center mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 border-b border-[#2a2a2a] bg-transparent flex-shrink-0" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between hover:bg-slate-700/30 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center flex-1 min-w-0">
            {orgAvatar}
            <div className="ml-3 overflow-hidden flex-1 min-w-0">
              <div className="font-bold text-white text-base truncate">{currentOrganization.name}</div>
              <div className="text-slate-400 text-xs font-medium">{roleLabel}</div>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen ? (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 z-50 max-h-96 overflow-y-auto">
            {organizations.map((membership) => {
              const isCurrent = membership.organization.id === currentOrganization?.id
              return (
                <button
                  type="button"
                  key={membership.organization.id}
                  onClick={() => {
                    switchOrganization(membership.organization.id)
                    setIsOpen(false)
                    if (isOnResourcePage()) {
                      router.push('/dashboard')
                    } else {
                      router.refresh()
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                    isCurrent ? 'bg-slate-700/30' : ''
                  }`}
                >
                  {membership.organization.logo_url ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-slate-600/50 bg-slate-700 flex-shrink-0">
                      <Image
                        src={membership.organization.logo_url}
                        alt={`${membership.organization.name} Logo`}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ring-2 ring-slate-600/50 flex-shrink-0"
                      style={{ backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #161616 100%)' }}
                    >
                      <span className="text-xs font-black text-white">{membership.organization.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="ml-3 flex-1 text-left min-w-0">
                    <div className="font-medium text-white text-sm truncate">{membership.organization.name}</div>
                    <div className="text-slate-400 text-xs">
                      {membership.role === 'owner' ? 'Owner' : membership.role === 'admin' ? 'Admin' : 'Staff'}
                    </div>
                  </div>
                  {isCurrent ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
