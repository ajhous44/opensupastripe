'use client'

import { Activity, useState } from 'react'
import { getTeamMembers, removeTeamMember, updateTeamMemberRole, getOrganizationInvites, cancelInvite } from '@/app/actions/team'
import InviteTeamMember from './InviteTeamMember'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import type { TeamMember, OrganizationInvite } from '@/types'
import { useRouter } from 'next/navigation'
import { DASHBOARD_PAGE_GUTTER, DASHBOARD_PANEL_SKY, DASHBOARD_SOFT_SURFACE } from '@/lib/dashboard-page-gutter'
import { cn } from '@/lib/utils'

interface TeamManagementClientProps {
  organizationId: string
  organizationName: string
  teamMembers: TeamMember[]
  invites: OrganizationInvite[]
  canAddTeamMembers: boolean
  memberCount: number
  userRole: 'owner' | 'admin'
}

export default function TeamManagementClient({
  organizationId,
  organizationName,
  teamMembers: initialTeamMembers,
  invites: initialInvites,
  canAddTeamMembers,
  memberCount,
  userRole: _userRole
}: TeamManagementClientProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [invites, setInvites] = useState<OrganizationInvite[]>(initialInvites)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [canceling, setCanceling] = useState<string | null>(null)
  const [removeConfirmation, setRemoveConfirmation] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null })
  const [cancelInviteConfirmation, setCancelInviteConfirmation] = useState<{ isOpen: boolean; inviteId: string | null }>({ isOpen: false, inviteId: null })
  const router = useRouter()

  const refreshData = async () => {
    const [membersResult, invitesResult] = await Promise.all([
      getTeamMembers(organizationId),
      getOrganizationInvites(organizationId)
    ])
    if (membersResult.data) setTeamMembers(membersResult.data)
    if (invitesResult.data) setInvites(invitesResult.data)
  }

  const handleRemove = (userId: string) => {
    setRemoveConfirmation({ isOpen: true, userId })
  }

  const confirmRemove = async () => {
    const { userId } = removeConfirmation
    if (!userId) return

    setRemoveConfirmation({ isOpen: false, userId: null })
    setRemoving(userId)
    try {
      const result = await removeTeamMember({ userId, organizationId })
      if (result.error) {
        alert(result.error.message)
      } else {
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Failed to remove team member')
    } finally {
      setRemoving(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'staff') => {
    setUpdating(userId)
    try {
      const result = await updateTeamMemberRole({ userId, organizationId, role: newRole })
      if (result.error) {
        alert(result.error.message)
      } else {
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  const handleCancelInvite = (inviteId: string) => {
    setCancelInviteConfirmation({ isOpen: true, inviteId })
  }

  const confirmCancelInvite = async () => {
    const { inviteId } = cancelInviteConfirmation
    if (!inviteId) return

    setCancelInviteConfirmation({ isOpen: false, inviteId: null })
    setCanceling(inviteId)
    try {
      const result = await cancelInvite({ inviteId, organizationId })
      if (result.error) {
        alert(result.error.message)
      } else {
        await refreshData()
        router.refresh()
      }
    } catch (error) {
      console.error('Error canceling invite:', error)
      alert('Failed to cancel invitation')
    } finally {
      setCanceling(null)
    }
  }

  return (
    <div className={DASHBOARD_SOFT_SURFACE}>
      <div className="border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-indigo-50">
        <div className={`${DASHBOARD_PAGE_GUTTER} py-5 sm:py-7`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Team
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                Invite people to help run{' '}
                <span className="font-medium text-slate-800">{organizationName}</span>. Only owners and
                admins can change who has access.
              </p>
            </div>
            <div className="shrink-0">
              {canAddTeamMembers ? (
                <button
                  type="button"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className={cn(
                    'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/45 focus:ring-offset-2 sm:w-auto',
                    showInviteForm
                      ? 'border border-slate-300/90 bg-white text-slate-800 hover:bg-slate-50'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  )}
                >
                  {showInviteForm ? 'Cancel' : 'Invite team member'}
                </button>
              ) : (
                <div
                  className="max-w-md rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-snug text-amber-950 shadow-sm"
                  role="status"
                >
                  Free tier cannot add team members.{' '}
                  <a
                    href="/dashboard/manage-subscription"
                    className="font-medium text-amber-900 underline decoration-amber-400/60 underline-offset-2 hover:text-amber-950"
                  >
                    Upgrade to add team members
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${DASHBOARD_PAGE_GUTTER} space-y-6 py-6 sm:py-8`}>
        {canAddTeamMembers ? (
          <Activity mode={showInviteForm ? 'visible' : 'hidden'}>
            <div>
              <InviteTeamMember
                organizationId={organizationId}
                onSuccess={async () => {
                  await refreshData()
                  setShowInviteForm(false)
                  router.refresh()
                }}
              />
            </div>
          </Activity>
        ) : null}

        {invites.length > 0 ? (
          <section className={`${DASHBOARD_PANEL_SKY} p-5 sm:p-6`} aria-labelledby="pending-invites-heading">
            <h2 id="pending-invites-heading" className="text-base font-semibold tracking-tight text-slate-900">
              Pending invites
            </h2>
            <p className="mt-1 text-sm text-slate-600">Invitations that have not been accepted yet.</p>
            <ul className="mt-4 space-y-3">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-col gap-3 rounded-xl border border-sky-100/80 bg-sky-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 52px' }}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900">{invite.email}</div>
                    <div className="mt-0.5 text-sm text-slate-600">
                      Role: <span className="capitalize text-slate-800">{invite.role}</span>
                      <span className="text-slate-400"> · </span>
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(invite.id)}
                    disabled={canceling === invite.id}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-200/80 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {canceling === invite.id ? 'Canceling…' : 'Revoke invite'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className={`${DASHBOARD_PANEL_SKY} overflow-hidden`} aria-labelledby="team-members-heading">
          <div className="border-b border-sky-200/50 bg-gradient-to-r from-sky-50/80 to-white px-5 py-4 sm:px-6">
            <h2 id="team-members-heading" className="text-base font-semibold tracking-tight text-slate-900">
              Team members
              <span className="ml-2 font-normal text-slate-500">({memberCount})</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">Roles control day-to-day access; billing stays with the owner.</p>
          </div>
          <div className="divide-y divide-sky-100/80">
            {teamMembers.map((member) => {
              const isOwner = false
              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-sky-50/35 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 64px' }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800 ring-1 ring-sky-200/60"
                      aria-hidden
                    >
                      {member.user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">
                        {member.user?.email || 'Unknown User'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {member.accepted_at
                          ? `Joined ${new Date(member.accepted_at).toLocaleDateString()}`
                          : 'Pending acceptance'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {!isOwner && (
                      <>
                        <label className="sr-only" htmlFor={`role-${member.user_id}`}>
                          Role for {member.user?.email || 'member'}
                        </label>
                        <select
                          id={`role-${member.user_id}`}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user_id, e.target.value as 'admin' | 'staff')}
                          disabled={updating === member.user_id}
                          className="rounded-lg border border-sky-200/70 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/35 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemove(member.user_id)}
                          disabled={removing === member.user_id}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removing === member.user_id ? 'Removing…' : 'Remove'}
                        </button>
                      </>
                    )}
                    {isOwner && (
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Remove Team Member Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={removeConfirmation.isOpen}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member? They will lose access to this organization."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveConfirmation({ isOpen: false, userId: null })}
        confirmButtonStyle="bg-red-600 hover:bg-red-700"
      />

      {/* Cancel Invite Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={cancelInviteConfirmation.isOpen}
        title="Cancel Invitation"
        message="Are you sure you want to cancel this invitation? The invite link will no longer work."
        confirmText="Cancel Invitation"
        cancelText="Keep Invitation"
        onConfirm={confirmCancelInvite}
        onCancel={() => setCancelInviteConfirmation({ isOpen: false, inviteId: null })}
        confirmButtonStyle="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

