'use client'

import { useState } from 'react'
import { z } from 'zod'
import { inviteTeamMember, checkCanAddTeamMember } from '@/app/actions/team'
import { DASHBOARD_PANEL_SKY } from '@/lib/dashboard-page-gutter'

interface InviteTeamMemberProps {
  organizationId: string
  onSuccess: () => void
}

const EmailSchema = z.string().email('Please enter a valid email address').min(1, 'Email is required').max(254, 'Email is too long')

export default function InviteTeamMember({ organizationId, onSuccess }: InviteTeamMemberProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    setLoading(true)

    try {
      // Validate email with Zod
      const trimmedEmail = email.trim()
      const emailValidation = EmailSchema.safeParse(trimmedEmail)
      
      if (!emailValidation.success) {
        const [firstError] = emailValidation.error.errors
        setEmailError(firstError.message)
        setLoading(false)
        return
      }

      // Check if can add team members
      const canAddResult = await checkCanAddTeamMember(organizationId)
      if (!canAddResult.canAdd) {
        setError('Free tier cannot add team members. Please upgrade your subscription.')
        setLoading(false)
        return
      }

      const result = await inviteTeamMember({
        email: trimmedEmail,
        organizationId,
        role
      })

      if (result.error) {
        setError(result.error.message)
      } else {
        setEmail('')
        setEmailError(null)
        onSuccess()
      }
    } catch (err) {
      console.error('Error inviting team member:', err)
      setError('Failed to send invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${DASHBOARD_PANEL_SKY} p-5 sm:p-6`}>
      <h3 className="mb-1 text-lg font-semibold tracking-tight text-slate-900">Invite a teammate</h3>
      <p className="mb-5 text-sm text-slate-600">They will receive an email with a link to join this organization.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="invite-email">
            Email address
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              // Clear email error when user starts typing
              if (emailError) {
                setEmailError(null)
              }
            }}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm transition-shadow focus:outline-none focus:ring-2 ${
              emailError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
                : 'border-sky-200/70 focus:border-sky-400 focus:ring-sky-400/35'
            }`}
            placeholder="team@example.com"
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="invite-role">
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
            className="w-full rounded-lg border border-sky-200/70 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
          >
            <option value="admin">Admin - Full access except billing</option>
            <option value="staff">Staff - Full access except billing</option>
          </select>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Both roles can manage the workspace dashboard. Only owners can manage billing.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50/90 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400/45 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </form>
    </div>
  )
}

