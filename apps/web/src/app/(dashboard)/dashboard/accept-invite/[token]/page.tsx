import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AcceptInviteClient from '@/components/team/AcceptInviteClient'

export const dynamic = 'force-dynamic'

export default async function AcceptInvitePage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard/accept-invite/' + token)
  }

  // Fetch invite details - query first, then filter in code to avoid .is() query issues
  const { data: inviteData, error: inviteError } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError) {
    console.error('Page invite lookup error:', inviteError)
  }

  // Check if invite is already accepted
  const invite = inviteData && !inviteData.accepted_at ? inviteData : null

  // Fetch organization details using secure function (only returns minimal info for valid invites)
  let organization: { id: string; name: string; subdomain: string } | null = null
  if (invite) {
    const { data: organizationData, error: organizationError } = await supabase
      .rpc('get_organization_for_invite', { p_invite_token: token })
    
    if (!organizationError && organizationData && organizationData.length > 0) {
      const [firstOrganization] = organizationData
      organization = firstOrganization
    }
  }

  if (inviteError || !inviteData) {
    console.error('Invite lookup failed:', { inviteError, token: token.substring(0, 10) + '...' })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">
            This invite link is invalid or has expired. Please contact the organization administrator for a new invite.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (!invite) {
    console.error('Invite already accepted:', inviteData.id)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invite Already Accepted</h1>
          <p className="text-gray-600 mb-6">
            This invite has already been accepted. You may already be a team member.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (!organization) {
    console.error('Organization not found for invite:', invite.organization_id)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">
            This invite link is invalid. Please contact the organization administrator for a new invite.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invite Expired</h1>
          <p className="text-gray-600 mb-6">
            This invite has expired. Please contact the organization administrator for a new invite.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Check if email matches
  if (invite.email !== user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Mismatch</h1>
          <p className="text-gray-600 mb-6">
            This invite was sent to <strong>{invite.email}</strong>, but you're logged in as <strong>{user.email}</strong>.
            Please log in with the correct email address.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Log In
          </a>
        </div>
      </div>
    )
  }

  // Check if already a team member
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('id')
    .eq('organization_id', invite.organization_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    // Already a member, redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <AcceptInviteClient
      token={token}
      organizationName={organization?.name || 'Organization'}
      role={invite.role}
    />
  )
}

