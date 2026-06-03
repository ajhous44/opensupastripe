'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, startTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'

// Import centralized types
import type { OrganizationInfo, OrganizationMembership } from '@/types'

const CURRENT_ORGANIZATION_STORAGE_KEY = 'opensupastripe:currentOrganizationId'

function readStoredOrganizationId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return localStorage.getItem(CURRENT_ORGANIZATION_STORAGE_KEY)
  } catch {
    return null
  }
}

interface OrganizationContextType {
  organizations: OrganizationMembership[]
  currentOrganization: OrganizationInfo | null
  currentOrganizationId: string | null
  userRole: 'owner' | 'admin' | 'staff' | null
  hasOrganization: boolean | null
  loading: boolean
  switchOrganization: (organizationId: string) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrganization: null,
  currentOrganizationId: null,
  userRole: null,
  hasOrganization: null,
  loading: true,
  switchOrganization: () => {},
  refreshOrganizations: async () => {}
})

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([])
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(
    readStoredOrganizationId,
  )
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const currentOrganization = organizations.find(d => d.organization.id === currentOrganizationId)?.organization || null
  const userRole = organizations.find(d => d.organization.id === currentOrganizationId)?.role || null

  const loadOrganizations = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setHasOrganization(false)
        setOrganizations([])
        setLoading(false)
        return
      }
      
      // Fetch owned organizations
      const { data: ownedOrganizations, error: ownedError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
      
      // Fetch team member organizations (without nested select to avoid RLS issues)
      const { data: teamMemberships, error: teamError } = await supabase
        .from('team_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
      
      if (ownedError || teamError) {
        console.error('Error fetching organizations:', ownedError || teamError)
        setHasOrganization(false)
        setOrganizations([])
        setLoading(false)
        return
      }
      
      // Fetch organization details for team members separately
      let teamOrganizations: OrganizationInfo[] = []
      if (teamMemberships && teamMemberships.length > 0) {
        const organizationIds = teamMemberships.map(tm => tm.organization_id)
        const { data: organizationsData, error: organizationsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', organizationIds)
        
        if (organizationsError) {
          console.error('Error fetching team organizations:', organizationsError)
        } else if (organizationsData) {
          teamOrganizations = organizationsData as OrganizationInfo[]
        }
      }
      
      // Combine owned and team member organizations
      const memberships: OrganizationMembership[] = []
      
      // Add owned organizations as 'owner' role
      if (ownedOrganizations) {
        for (const d of ownedOrganizations) {
          memberships.push({
            organization: d as OrganizationInfo,
            role: 'owner'
          })
        }
      }
      
      // Add team member organizations
      if (teamMemberships && teamOrganizations.length > 0) {
        for (const tm of teamMemberships) {
          const organization = teamOrganizations.find(d => d.id === tm.organization_id)
          if (organization && !memberships.find(m => m.organization.id === organization.id)) {
            memberships.push({
              organization: organization as OrganizationInfo,
              role: tm.role as 'admin' | 'staff'
            })
          }
        }
      }
      
      setOrganizations(memberships)
      setHasOrganization(memberships.length > 0)
      
      // Set current organization if not set or if current one is no longer accessible
      if (memberships.length > 0) {
        const storedId = localStorage.getItem(CURRENT_ORGANIZATION_STORAGE_KEY)
        const validStoredId = storedId && memberships.find(m => m.organization.id === storedId)
        
        if (validStoredId) {
          setCurrentOrganizationId(storedId)
        } else {
          // Default to first organization (prefer owned over team member)
          const owned = memberships.find(m => m.role === 'owner')
          setCurrentOrganizationId(owned ? owned.organization.id : memberships[0].organization.id)
        }
      } else {
        setCurrentOrganizationId(null)
      }
    } catch (error) {
      console.error('Error in loadOrganizations:', error)
      setHasOrganization(false)
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      void loadOrganizations()
    })

    // Listen for organization creation/update events
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as OrganizationInfo | undefined
      if (detail) {
        loadOrganizations()
      }
    }
    window.addEventListener('organization:created', handler as EventListener)
    window.addEventListener('organization:updated', handler as EventListener)
    return () => {
      window.removeEventListener('organization:created', handler as EventListener)
      window.removeEventListener('organization:updated', handler as EventListener)
    }
  }, [loadOrganizations])

  // Persist current organization ID to localStorage
  useEffect(() => {
    try {
      if (currentOrganizationId) {
        localStorage.setItem(CURRENT_ORGANIZATION_STORAGE_KEY, currentOrganizationId)
      } else {
        localStorage.removeItem(CURRENT_ORGANIZATION_STORAGE_KEY)
      }
    } catch {}
  }, [currentOrganizationId])

  const switchOrganization = useCallback((organizationId: string) => {
    if (organizations.find(d => d.organization.id === organizationId)) {
      setCurrentOrganizationId(organizationId)
      // Dispatch event to refresh data
      window.dispatchEvent(new CustomEvent('organization:switched', { detail: { organizationId } }))
    }
  }, [organizations])

  const refreshOrganizations = useCallback(async () => {
    await loadOrganizations()
  }, [loadOrganizations])

  const contextValue = useMemo(() => ({
    organizations,
    currentOrganization,
    currentOrganizationId,
    userRole,
    hasOrganization,
    loading,
    switchOrganization,
    refreshOrganizations,
  }), [
    organizations,
    currentOrganization,
    currentOrganizationId,
    userRole,
    hasOrganization,
    loading,
    switchOrganization,
    refreshOrganizations,
  ])

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  return useContext(OrganizationContext)
} 
