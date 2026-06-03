/**
 * Shared Resend / support addressing for My Company transactional email.
 */

/** Public support inbox for templates and marketing (not Reply-To). */
export const SUPPORT_INFO_EMAIL = process.env.SUPPORT_INFO_EMAIL || 'hello@example.com'

export function supastripeTeamReplyToArray(): string[] {
  const configured = process.env.RESEND_REPLY_TO_EMAILS
  if (!configured) return [SUPPORT_INFO_EMAIL]

  const emails = configured
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)

  return emails.length > 0 ? emails : [SUPPORT_INFO_EMAIL]
}
