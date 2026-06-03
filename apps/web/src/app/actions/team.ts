"use server"

import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import type { TeamMember, OrganizationInvite } from '@/types'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { config } from '@/lib/config'
import { supastripeTeamReplyToArray } from '@/lib/email/resend-addresses'

const InviteTeamMemberSchema = z.object({
  email: z.string().email(),
  organizationId: z.string().uuid(),
  role: z.enum(['admin', 'staff'])
})

const AcceptInviteSchema = z.object({
  token: z.string()
})

const RemoveTeamMemberSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid()
})

const UpdateTeamMemberRoleSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.enum(['admin', 'staff'])
})

const CancelInviteSchema = z.object({
  inviteId: z.string().uuid(),
  organizationId: z.string().uuid()
})

async function canManageOrganization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  userId: string
) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    return false
  }

  if (organization.owner_id === userId) {
    return true
  }

  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  return teamMember?.role === 'admin'
}

/**
 * Check if organization can add team members (not free tier)
 */
export async function checkCanAddTeamMember(organizationId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { canAdd: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  const canManage = await canManageOrganization(supabase, organizationId, user.id)
  if (!canManage) {
    return { canAdd: false, error: { code: 'FORBIDDEN', message: 'Not authorized to manage team members' } }
  }
  
  // Check subscription status
  const { data: subscription } = await supabase
    .rpc('can_add_team_member', { p_organization_id: organizationId })
  
  return { canAdd: subscription === true, error: null }
}

/**
 * Get current team member count for a organization
 */
export async function getTeamMemberCount(organizationId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { count: 0, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  const canManage = await canManageOrganization(supabase, organizationId, user.id)
  if (!canManage) {
    return { count: 0, error: { code: 'FORBIDDEN', message: 'Not authorized to view team members' } }
  }
  
  const { data: count } = await supabase
    .rpc('get_team_member_count', { p_organization_id: organizationId })
  
  return { count: count || 0, error: null }
}

/**
 * Invite a team member (new user via email or existing user directly)
 */
export async function inviteTeamMember(args: z.infer<typeof InviteTeamMemberSchema>) {
  const parsed = InviteTeamMemberSchema.safeParse(args)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } }
  }

  const { email, organizationId, role } = parsed.data
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Verify user has permission (owner or admin) and get organization name for email
  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id, name')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    return { error: { code: 'NOT_FOUND', message: 'Organization not found' } }
  }

  const isOwner = organization.owner_id === user.id
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  const isAdmin = teamMember?.role === 'admin'
  
  if (!isOwner && !isAdmin) {
    return { error: { code: 'FORBIDDEN', message: 'Only owners and admins can invite team members' } }
  }

  // Check subscription limits
  const { data: canAdd } = await supabase
    .rpc('can_add_team_member', { p_organization_id: organizationId })
  
  if (!canAdd) {
    return { error: { code: 'SUBSCRIPTION_LIMIT', message: 'Free tier cannot add team members. Please upgrade your subscription.' } }
  }

  // Check if there's already a pending invite for this email
  // Query all invites first, then filter in code to avoid .is() query issues
  const { data: existingInvites, error: checkError } = await supabase
    .from('organization_invites')
    .select('id, accepted_at, expires_at')
    .eq('organization_id', organizationId)
    .eq('email', email)

  if (checkError) {
    console.error('Error checking for existing invites:', checkError)
    // Continue anyway - better to try creating than to block due to a query error
  } else if (existingInvites) {
    // Check if any invite is pending (not accepted and not expired)
    const pendingInvite = existingInvites.find(inv => 
      !inv.accepted_at && new Date(inv.expires_at) > new Date()
    )
    
    if (pendingInvite) {
      return { error: { code: 'INVITE_EXISTS', message: 'An invite for this email already exists' } }
    }
  }

  // Create invite token (works for both new and existing users)
  // Existing users can accept directly, new users can sign up then accept
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const { error: inviteError } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: organizationId,
      email,
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString()
    })

  if (inviteError) {
    console.error('Error creating invite:', inviteError)
    return { error: { code: 'DB_ERROR', message: inviteError.message } }
  }

  // Get inviter info from current user (we already have user from auth.getUser() above)
  const inviterEmail = user.email || 'a team member'
  const inviterName = user.user_metadata?.full_name || user.user_metadata?.name || inviterEmail.split('@')[0]

  // Send email with invite link
  const inviteUrl = `${config.APP_URL}/dashboard/accept-invite/${token}`
  
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey)
      const organizationName = organization?.name || 'the team'
      const roleDisplay = role === 'admin' ? 'Administrator' : 'Staff Member'

      // HTML escape function for email template safety
      const escapeHtml = (text: string): string => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
      }

      const safeOrganizationName = escapeHtml(organizationName)
      const safeInviterName = escapeHtml(inviterName)
      const safeRoleDisplay = escapeHtml(roleDisplay)

      // Use absolute URL for email clients - ensure it's publicly accessible
      const logoUrl = `${config.APP_URL.replace(/\/$/, '')}/logo.svg`

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'My Company <noreply@example.com>',
        to: email,
        replyTo: supastripeTeamReplyToArray(),
        subject: `You've been invited to join ${organizationName} on My Company`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="margin-bottom: 20px;">
                <img src="${logoUrl}" alt="My Company" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; border: 0;" />
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">You've Been Invited!</h1>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi there,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>${safeInviterName}</strong> has invited you to join <strong>${safeOrganizationName}</strong> on My Company as a <strong>${safeRoleDisplay}</strong>.
              </p>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Role:</strong> ${safeRoleDisplay}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Organization:</strong> ${safeOrganizationName}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;"><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you don't have an My Company account yet, you'll be prompted to create one when you click the link above.
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #4f46e5; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                ${inviteUrl}
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
        text: `
You've Been Invited to Join ${organizationName} on My Company

Hi there,

${inviterName} has invited you to join ${organizationName} on My Company as a ${roleDisplay}.

Role: ${roleDisplay}
Organization: ${organizationName}
Expires: ${new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Accept your invitation by clicking the link below:
${inviteUrl}

If you don't have an My Company account yet, you'll be prompted to create one when you click the link above.

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        `.trim(),
      })

      if (emailError) {
        console.error('Error sending invite email:', emailError)
        // Don't fail the invite creation if email fails - invite is still created
        // The invite URL is still returned so it can be shared manually if needed
      }
    } catch (emailErr) {
      console.error('Error sending invite email:', emailErr)
      // Don't fail the invite creation if email fails
    }
  } else {
    console.warn('RESEND_API_KEY not configured - invite email not sent')
  }

  return { success: true }
}

/**
 * Accept an invite token
 */
export async function acceptInvite(args: z.infer<typeof AcceptInviteSchema>) {
  const parsed = AcceptInviteSchema.safeParse(args)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid token' } }
  }

  const { token } = parsed.data
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Find invite - query first, then filter in code to avoid query issues
  const { data: inviteData, error: inviteError } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError) {
    console.error('Invite lookup error:', {
      error: inviteError,
      code: inviteError.code,
      message: inviteError.message,
      details: inviteError.details,
      hint: inviteError.hint,
      token: token.substring(0, 10) + '...'
    })
    return { error: { code: 'INVALID_TOKEN', message: `Invalid or expired invite: ${inviteError.message}` } }
  }

  if (!inviteData) {
    console.error('Invite not found for token:', token.substring(0, 10) + '...')
    return { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired invite' } }
  }

  // Check if already accepted
  if (inviteData.accepted_at) {
    console.error('Invite already accepted:', inviteData.id)
    return { error: { code: 'ALREADY_ACCEPTED', message: 'This invite has already been accepted' } }
  }

  const invite = inviteData

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return { error: { code: 'EXPIRED', message: 'Invite has expired' } }
  }

  // Verify email matches
  if (invite.email !== user.email) {
    console.error('Email mismatch:', { inviteEmail: invite.email, userEmail: user.email })
    return { 
      error: { 
        code: 'EMAIL_MISMATCH', 
        message: `This invite was sent to ${invite.email}, but you're logged in as ${user.email}. Please log out and log in with the correct email address.` 
      } 
    }
  }

  // Check if already a team member
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('id')
    .eq('organization_id', invite.organization_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    return { error: { code: 'ALREADY_MEMBER', message: 'You are already a team member' } }
  }

  // Create team member record
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      organization_id: invite.organization_id,
      role: invite.role,
      invited_by: invite.invited_by,
      accepted_at: new Date().toISOString()
    })

  if (memberError) {
    console.error('Error creating team member:', {
      error: memberError,
      code: memberError.code,
      message: memberError.message,
      details: memberError.details,
      hint: memberError.hint,
      userId: user.id,
      organizationId: invite.organization_id
    })
    return { error: { code: 'DB_ERROR', message: memberError.message } }
  }

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from('organization_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (updateError) {
    console.error('Error updating invite:', {
      error: updateError,
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      inviteId: invite.id,
      userId: user.id
    })
    // Critical: If invite update fails, we have an inconsistent state
    // The team member was created but invite wasn't marked as accepted
    // We should still return an error so the user knows something went wrong
    // TODO: Consider rolling back team member creation or using a transaction
    return { 
      error: { 
        code: 'UPDATE_ERROR', 
        message: `Team member created but failed to mark invite as accepted: ${updateError.message}` 
      } 
    }
  }

  return { success: true, organizationId: invite.organization_id }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(args: z.infer<typeof RemoveTeamMemberSchema>) {
  const parsed = RemoveTeamMemberSchema.safeParse(args)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } }
  }

  const { userId, organizationId } = parsed.data
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Verify user has permission (owner or admin)
  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    return { error: { code: 'NOT_FOUND', message: 'Organization not found' } }
  }

  const isOwner = organization.owner_id === user.id
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  const isAdmin = teamMember?.role === 'admin'
  
  if (!isOwner && !isAdmin) {
    return { error: { code: 'FORBIDDEN', message: 'Only owners and admins can remove team members' } }
  }

  // Cannot remove owner
  if (userId === organization.owner_id) {
    return { error: { code: 'FORBIDDEN', message: 'Cannot remove organization owner' } }
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing team member:', error)
    return { error: { code: 'DB_ERROR', message: error.message } }
  }

  return { success: true }
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(args: z.infer<typeof UpdateTeamMemberRoleSchema>) {
  const parsed = UpdateTeamMemberRoleSchema.safeParse(args)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } }
  }

  const { userId, organizationId, role } = parsed.data
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Verify user has permission (owner or admin)
  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    return { error: { code: 'NOT_FOUND', message: 'Organization not found' } }
  }

  const isOwner = organization.owner_id === user.id
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  const isAdmin = teamMember?.role === 'admin'
  
  if (!isOwner && !isAdmin) {
    return { error: { code: 'FORBIDDEN', message: 'Only owners and admins can update team member roles' } }
  }

  // Cannot change owner role
  if (userId === organization.owner_id) {
    return { error: { code: 'FORBIDDEN', message: 'Cannot change organization owner role' } }
  }

  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating team member role:', error)
    return { error: { code: 'DB_ERROR', message: error.message } }
  }

  return { success: true }
}

/**
 * Get all team members for a organization
 */
export async function getTeamMembers(organizationId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: [], error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  const canManage = await canManageOrganization(supabase, organizationId, user.id)
  if (!canManage) {
    return { data: [], error: { code: 'FORBIDDEN', message: 'Not authorized to view team members' } }
  }

  const { data, error } = await supabase
    .rpc('get_organization_team_members', { p_organization_id: organizationId })

  if (error) {
    console.error('Error fetching team members:', error)
    return { data: [], error: { code: 'FETCH_ERROR', message: error.message } }
  }

  // Map the flat structure back to nested user object for compatibility
  const formattedData = (data || []).map((member: any) => ({
    ...member,
    user: {
      id: member.user_id,
      email: member.email
    }
  }))

  return { data: formattedData as unknown as TeamMember[] }
}

/**
 * Get all organizations user has access to
 */
export async function getUserOrganizations() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Get owned organizations
  const { data: ownedOrganizations } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)

  // Get team member organizations (without nested select)
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select('organization_id, role')
    .eq('user_id', user.id)

  // Fetch organization details for team members separately
  let teamOrganizations: any[] = []
  if (teamMemberships && teamMemberships.length > 0) {
    const organizationIds = teamMemberships.map(tm => tm.organization_id)
    const { data: organizationsData } = await supabase
      .from('organizations')
      .select('*')
      .in('id', organizationIds)
    
    if (organizationsData) {
      teamOrganizations = organizationsData
    }
  }

  const memberships = []
  
  if (ownedOrganizations) {
    for (const d of ownedOrganizations) {
      memberships.push({
        organization: d,
        role: 'owner' as const
      })
    }
  }

  if (teamMemberships && teamOrganizations.length > 0) {
    for (const tm of teamMemberships) {
      const organization = teamOrganizations.find(d => d.id === tm.organization_id)
      if (organization) {
        memberships.push({
          organization,
          role: tm.role as 'admin' | 'staff'
        })
      }
    }
  }

  return { data: memberships }
}

/**
 * Get pending invites for a organization
 */
export async function getOrganizationInvites(organizationId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: [], error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  const canManage = await canManageOrganization(supabase, organizationId, user.id)
  if (!canManage) {
    return { data: [], error: { code: 'FORBIDDEN', message: 'Not authorized to view organization invites' } }
  }

  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invites:', error)
    return { data: [], error: { code: 'FETCH_ERROR', message: error.message } }
  }

  return { data: data as unknown as OrganizationInvite[] }
}

/**
 * Cancel a pending invite
 */
export async function cancelInvite(args: z.infer<typeof CancelInviteSchema>) {
  const parsed = CancelInviteSchema.safeParse(args)
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } }
  }

  const { inviteId, organizationId } = parsed.data
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }
  }

  // Verify user has permission (owner or admin)
  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    return { error: { code: 'NOT_FOUND', message: 'Organization not found' } }
  }

  const isOwner = organization.owner_id === user.id
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  const isAdmin = teamMember?.role === 'admin'
  
  if (!isOwner && !isAdmin) {
    return { error: { code: 'FORBIDDEN', message: 'Only owners and admins can cancel invites' } }
  }

  // Verify the invite belongs to this organization
  const { data: invite } = await supabase
    .from('organization_invites')
    .select('organization_id, accepted_at')
    .eq('id', inviteId)
    .single()

  if (!invite) {
    return { error: { code: 'NOT_FOUND', message: 'Invite not found' } }
  }

  if (invite.organization_id !== organizationId) {
    return { error: { code: 'FORBIDDEN', message: 'Invite does not belong to this organization' } }
  }

  if (invite.accepted_at) {
    return { error: { code: 'ALREADY_ACCEPTED', message: 'This invite has already been accepted' } }
  }

  // Delete the invite
  const { error: deleteError } = await supabase
    .from('organization_invites')
    .delete()
    .eq('id', inviteId)
    .eq('organization_id', organizationId)

  if (deleteError) {
    console.error('Error canceling invite:', deleteError)
    return { error: { code: 'DB_ERROR', message: deleteError.message } }
  }

  return { success: true }
}
