'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/lib/OrganizationContext'
import { getTeamMembers, getOrganizationInvites, checkCanAddTeamMember, getTeamMemberCount } from '@/app/actions/team'
import TeamManagementClient from '@/components/team/TeamManagementClient'
import { DASHBOARD_PAGE_GUTTER, DASHBOARD_SOFT_SURFACE } from '@/lib/dashboard-page-gutter'

export default function TeamPage() {
  const router = useRouter()
  const { currentOrganization, currentOrganizationId, userRole, hasOrganization, loading: ctxLoading } = useOrganization()

  const canManageTeam = userRole === 'owner' || userRole === 'admin'

  useEffect(() => {
    if (ctxLoading) return

    if (!hasOrganization || !currentOrganizationId) {
      router.push('/dashboard')
      return
    }

    if (!canManageTeam) {
      router.push('/dashboard')
    }
  }, [currentOrganizationId, hasOrganization, canManageTeam, ctxLoading, router])

  const teamKey = !ctxLoading && currentOrganizationId && canManageTeam
    ? ['team-data', currentOrganizationId]
    : null
  const { data: teamResult, isLoading } = useSWR(
    teamKey,
    async () => {
      const [teamMembersResult, invitesResult, canAddResult, countResult] = await Promise.all([
        getTeamMembers(currentOrganizationId!),
        getOrganizationInvites(currentOrganizationId!),
        checkCanAddTeamMember(currentOrganizationId!),
        getTeamMemberCount(currentOrganizationId!)
      ])

      return {
        teamMembers: teamMembersResult.data || [],
        invites: invitesResult.data || [],
        canAddTeamMembers: canAddResult.canAdd,
        memberCount: countResult.count || 0
      }
    },
    { keepPreviousData: true }
  )

  // Show loading while context or data is loading
  if (ctxLoading || isLoading) {
    return (
      <div className={DASHBOARD_SOFT_SURFACE}>
        <div className="border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-indigo-50">
          <div className={`${DASHBOARD_PAGE_GUTTER} py-5 sm:py-7`}>
            <div className="animate-pulse space-y-3">
              <div className="h-8 max-w-xs rounded-lg bg-gradient-to-r from-sky-100 to-sky-200/80" />
              <div className="h-4 max-w-lg rounded-md bg-sky-100/80" />
            </div>
          </div>
        </div>
        <div className={`${DASHBOARD_PAGE_GUTTER} space-y-6 py-6 sm:py-8`}>
          <div className="animate-pulse rounded-2xl border border-sky-200/40 bg-white/80 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-5 w-40 rounded-md bg-gradient-to-r from-slate-200 to-sky-100" />
              <div className="h-24 rounded-xl bg-gradient-to-r from-slate-100 to-sky-50" />
            </div>
          </div>
          <div className="animate-pulse rounded-2xl border border-sky-200/40 bg-white/80 p-6 shadow-sm">
            <div className="h-5 w-48 rounded-md bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-14 rounded-xl bg-slate-100" />
              <div className="h-14 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if no access
  if (!currentOrganizationId || !canManageTeam) {
    return null
  }

  return (
    <TeamManagementClient
      organizationId={currentOrganizationId}
      organizationName={currentOrganization?.name || 'Organization'}
      teamMembers={teamResult?.teamMembers || []}
      invites={teamResult?.invites || []}
      canAddTeamMembers={teamResult?.canAddTeamMembers || false}
      memberCount={teamResult?.memberCount || 0}
      userRole={userRole as 'owner' | 'admin'}
    />
  )
}
