"use server"

import { z } from 'zod'
import { Resend } from 'resend'
import { sanitizeInput } from '@/lib/form-security'
import { SUPPORT_INFO_EMAIL } from '@/lib/email/resend-addresses'

// Rate limiting for contact form submissions (in-memory)
const submissionTimestamps = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_SUBMISSIONS_PER_MINUTE = 3 // Max 3 submissions per minute per email

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of submissionTimestamps.entries()) {
    const recentTimestamps = timestamps.filter(t => t > now - RATE_LIMIT_WINDOW_MS)
    if (recentTimestamps.length === 0) {
      submissionTimestamps.delete(key)
    } else {
      submissionTimestamps.set(key, recentTimestamps)
    }
  }
}, 5 * 60 * 1000)

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const timestamps = submissionTimestamps.get(identifier) || []
  const recentTimestamps = timestamps.filter(t => t > now - RATE_LIMIT_WINDOW_MS)
  
  if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_MINUTE) {
    return false
  }
  
  recentTimestamps.push(now)
  submissionTimestamps.set(identifier, recentTimestamps)
  return true
}

const ContactFormSchema = z.object({
  'first-name': z.string().min(1, 'First name is required').max(100, 'First name too long').trim().transform(sanitizeInput),
  'last-name': z.string().min(1, 'Last name is required').max(100, 'Last name too long').trim().transform(sanitizeInput),
  email: z.string().email('Invalid email address').max(254, 'Email too long').toLowerCase(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,20}$/, 'Invalid phone format').optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long').trim().transform(sanitizeInput),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long').trim().transform(sanitizeInput),
  timestamp: z.number().optional(), // Time-based honeypot
})

export type ContactFormInput = z.infer<typeof ContactFormSchema>

function configuredContactRecipients(): string[] {
  const configured = process.env.CONTACT_FORM_TO_EMAILS || SUPPORT_INFO_EMAIL
  const recipients = configured
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)

  return recipients.length > 0 ? recipients : [SUPPORT_INFO_EMAIL]
}

export async function submitContactForm(input: ContactFormInput): Promise<{ success: boolean; error?: { code: string; message: string } }> {
  console.log('Contact form submission received:', {
    subject: input.subject,
    messageLength: input.message?.length,
  })

  // Time-based honeypot: reject submissions faster than 3 seconds
  if (input.timestamp) {
    const timeSinceRender = Date.now() - input.timestamp
    if (timeSinceRender < 3000) {
      console.warn('Spam detected - submission too fast:', timeSinceRender, 'ms')
      return { success: false, error: { code: 'SPAM_DETECTED', message: 'Please try again' } }
    }
  }

  const parsed = ContactFormSchema.safeParse(input)
  if (!parsed.success) {
    console.error('Contact form validation error:', JSON.stringify(parsed.error.errors, null, 2))
    console.error('Received input:', JSON.stringify(input, null, 2))
    // Return more specific error message
    const [firstError] = parsed.error.errors
    const fieldName = firstError.path.join('.')
    return { 
      success: false, 
      error: { 
        code: 'VALIDATION_ERROR', 
        message: `${fieldName ? `${fieldName}: ` : ''}${firstError.message}` 
      } 
    }
  }

  const { email, phone, 'first-name': firstName, 'last-name': lastName, subject, message } = parsed.data

  // Rate limiting by email
  if (!checkRateLimit(email)) {
    return { success: false, error: { code: 'RATE_LIMIT', message: 'Too many submissions. Please try again in a minute.' } }
  }

  // Check for Resend API key
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, error: { code: 'CONFIG_ERROR', message: 'Email service is not configured. Please try again later.' } }
  }

  const resend = new Resend(resendApiKey)
  const fullName = `${firstName} ${lastName}`
  const recipients = configuredContactRecipients()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'My Company Contact <contact@example.com>'

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

  // Escape user input for HTML email display (values are already sanitized, but escape for HTML context)
  const safeFullName = escapeHtml(fullName)
  const safeEmailDisplay = escapeHtml(email)
  const safePhoneDisplay = phone ? escapeHtml(phone) : ''
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>') // Convert newlines to <br> for HTML

  try {
    // Send email to both recipients
    console.log('Sending contact form email:', {
      to: recipients,
      subject: `Contact Form: ${subject}`,
    })

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${safeFullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${safeEmailDisplay}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${safePhoneDisplay}</a></p>` : ''}
            <p><strong>Subject:</strong> ${safeSubject}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Message:</h3>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #4f46e5; white-space: pre-wrap;">${safeMessage}</div>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This email was sent from the My Company contact form. You can reply directly to this email to respond to ${safeFullName}.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
This email was sent from the My Company contact form. You can reply directly to this email to respond to ${fullName}.
      `.trim(),
    })

    if (emailResult.error) {
      console.error('Resend email error:', JSON.stringify(emailResult.error, null, 2))
      console.error('Resend error details:', {
        statusCode: emailResult.error.statusCode,
        message: emailResult.error.message,
        name: emailResult.error.name,
      })
      return { 
        success: false, 
        error: { 
          code: 'EMAIL_ERROR', 
          message: `Failed to send email: ${emailResult.error.message || 'Unknown error'}. Please try again later.` 
        } 
      }
    }

        console.log('Contact form email sent successfully:', {
          id: emailResult.data?.id,
        })

    return { success: true }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return { success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred. Please try again later.' } }
  }
}

