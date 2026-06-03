import type { User } from '@supabase/supabase-js'
import { Resend } from 'resend'

import { supastripeTeamReplyToArray, SUPPORT_INFO_EMAIL } from '@/lib/email/resend-addresses'

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function firstName(displayName: string): string {
  const trimmed = displayName.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] ?? trimmed
}

function buildSignupWelcomeContent(args: {
  greetingHtml: string
  greetingPlain: string
  dashboardUrl: string
  logoUrl: string
}) {
  const { greetingHtml, greetingPlain, dashboardUrl, logoUrl } = args

  const html = `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="margin-bottom: 16px;">
                <img src="${logoUrl}" alt="My Company" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; border: 0;" />
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to My Company</h1>
              <p style="color: rgba(255,255,255,0.92); margin: 12px 0 0; font-size: 15px;">Your multitenant SaaS workspace</p>
            </div>
            <div style="background-color: #ffffff; padding: 28px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 18px;">
                ${greetingHtml}
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 18px;">
                Thanks for signing up. My Company helps you launch organizations, invite teammates, manage subscriptions, and ship on Supabase + Stripe + Vercel.
              </p>
              <div style="background-color: #f9fafb; padding: 18px 20px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #4f46e5;">
                <p style="color: #374151; font-size: 15px; margin: 0 0 10px;"><strong>Recommended next steps</strong></p>
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.55; margin: 0; padding-left: 18px;">
                  <li style="margin-bottom: 8px;">Create or join an organization from your dashboard.</li>
                  <li style="margin-bottom: 8px;">Invite teammates and configure Stripe billing when you are ready.</li>
                  <li>Explore the starter codebase and extend it with your product features.</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 28px 0 22px;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Go to dashboard
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.55; margin: 0;">
                Questions? Reply to this email to reach our team. For general support, email <a href="mailto:${SUPPORT_INFO_EMAIL}" style="color: #4f46e5;">${SUPPORT_INFO_EMAIL}</a> or use in-app chat from your dashboard.
              </p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 20px 8px 0;">
              You received this because an My Company account was created with this email address.
            </p>
          </div>
        `.trim()

  const text = `
Welcome to My Company

${greetingPlain}

Thanks for signing up. My Company helps you launch organizations, invite teammates, manage subscriptions, and ship on Supabase + Stripe + Vercel.

Recommended next steps:
- Create or join an organization from your dashboard.
- Invite teammates and configure Stripe billing when you are ready.
- Explore the starter codebase and extend it with your product features.

Dashboard: ${dashboardUrl}

Questions? Reply to this email to reach our team. For general support, email ${SUPPORT_INFO_EMAIL} or use in-app chat from your dashboard.

You received this because an My Company account was created with this email address.
      `.trim()

  return { html, text }
}

/**
 * Sends the standard SaaS welcome email after account creation (email/password or OAuth).
 * Failures are logged; callers should not treat email delivery as authoritative for signup success.
 */
export async function sendSignupWelcomeEmail(options: {
  to: string
  displayName?: string | null
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.warn('sendSignupWelcomeEmail: RESEND_API_KEY not configured')
    return
  }

  const baseUrl = appBaseUrl()
  const dashboardUrl = `${baseUrl}/dashboard`
  const logoUrl = `${baseUrl}/logo.svg`

  const rawFirst = options.displayName ? firstName(options.displayName) : ''
  const greetingPlain = rawFirst ? `Hi ${rawFirst.replace(/[\r\n]+/g, ' ')},` : 'Hi there,'
  const greetingHtml = rawFirst ? `Hi ${escapeHtml(rawFirst)},` : 'Hi there,'

  const { html, text } = buildSignupWelcomeContent({
    greetingHtml,
    greetingPlain,
    dashboardUrl,
    logoUrl,
  })

  try {
    const resend = new Resend(resendApiKey)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'My Company <noreply@example.com>',
      to: options.to,
      replyTo: supastripeTeamReplyToArray(),
      subject: 'Welcome to My Company',
      html,
      text,
    })

    if (error) {
      console.error('sendSignupWelcomeEmail: Resend error', error)
    }
  } catch (e) {
    console.error('sendSignupWelcomeEmail: unexpected failure', e)
  }
}

/** OAuth sign-ins only: skip welcome when the auth user has existed longer than this (repeat logins). */
export const SIGNUP_WELCOME_OAUTH_MAX_USER_AGE_MS = 15 * 60 * 1000

/**
 * True when this looks like a brand-new OAuth registration (single non-email identity).
 * Avoids duplicate welcomes when email/password users confirm via the same `/auth/callback` exchange.
 */
export function shouldSendOAuthSignupWelcome(user: Pick<User, 'identities'>): boolean {
  const identities = user.identities ?? []
  if (identities.length !== 1) return false
  const provider = identities[0]?.provider
  if (!provider) return false
  return provider !== 'email' && provider !== 'phone'
}

/** Used after OAuth callback to avoid emailing returning users on every login. */
export function isLikelyFreshAuthUser(createdAtIso: string | undefined, maxAgeMs: number): boolean {
  if (!createdAtIso) return false
  const created = new Date(createdAtIso).getTime()
  if (Number.isNaN(created)) return false
  return Date.now() - created <= maxAgeMs
}
