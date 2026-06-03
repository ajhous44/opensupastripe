import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

// Constants
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_FORM_FIELD = '_csrf';
const HONEYPOT_FIELD = 'website'; // Common field that humans wouldn't fill but bots might
const MIN_FORM_SUBMISSION_TIME_MS = 1000; // Minimum time a human would take to fill a form (1 second)

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

/**
 * Creates a CSRF token and sets it in a cookie for form protection
 * @returns CSRF token to be used in the form
 */
export async function generateCsrfToken(): Promise<string> {
  const token = nanoid(32);
  
  // Set the CSRF token in a cookie (Next.js server action)
  const cookieStore = await cookies();
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour expiry
  });
  
  return token;
}

/**
 * Validates a CSRF token from a form submission
 * @param formData FormData from the form submission
 * @returns Boolean indicating if the CSRF token is valid
 */
export async function validateCsrfToken(formData: FormData): Promise<boolean> {
  const token = formData.get(CSRF_FORM_FIELD) as string;
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  // Delete the token cookie after validation (one-time use)
  cookieStore.delete(CSRF_COOKIE_NAME);
  
  return token === storedToken && !!token;
}

/**
 * Schema for honeypot validation
 */
export interface HoneypotData {
  timestamp: number;
  [HONEYPOT_FIELD]?: string;
}

/**
 * Creates hidden honeypot fields to detect bots
 * @returns Object with honeypot data to add to forms
 */
export function createHoneypotField(): HoneypotData {
  return {
    timestamp: Date.now(),
    [HONEYPOT_FIELD]: '',
  };
}

/**
 * Checks if the form submission might be from a bot based on honeypot fields
 * @param formData FormData from the form submission
 * @returns Object with isBot flag and reason
 */
export function checkForBot(formData: FormData): { isBot: boolean; reason?: string } {
  // Check if honeypot field was filled
  const honeypotValue = formData.get(HONEYPOT_FIELD) as string;
  if (honeypotValue) {
    return { isBot: true, reason: 'honeypot_filled' };
  }
  
  // Check submission time
  const timestamp = Number(formData.get('timestamp') || 0);
  const submissionTime = Date.now() - timestamp;
  if (timestamp > 0 && submissionTime < MIN_FORM_SUBMISSION_TIME_MS) {
    return { isBot: true, reason: 'too_fast' };
  }
  
  return { isBot: false };
}

/**
 * Creates a form validation schema with common validators
 * @param schema Zod schema to extend with common validators
 * @returns Extended schema with common validators
 */
export function createFormSchema<T extends z.ZodRawShape>(schema: T) {
  return z.object({
    ...schema,
    _csrf: z.string().min(1, "CSRF token is required"),
    timestamp: z.number().min(1, "Timestamp is required"),
    [HONEYPOT_FIELD]: z.string().max(0, "This field should be empty"),
  });
}

/**
 * Server action wrapper that validates a form submission with CSRF and honeypot checks
 * @param formData The FormData from the form submission
 * @param schema Optional Zod schema for validating form data
 * @param handler Function to handle the validated form data
 * @returns Result of the handler function or error object
 */
export async function secureFormAction<T extends Record<string, unknown>, R>(
  formData: FormData,
  schema?: z.ZodType<T>,
  handler?: (data: T) => Promise<R>
): Promise<{ success: boolean; data?: R; error?: string }> {
  try {
    // Check for CSRF token
    if (!await validateCsrfToken(formData)) {
      return { success: false, error: "Invalid or expired form submission" };
    }
    
    // Check for bot submission
    const botCheck = checkForBot(formData);
    if (botCheck.isBot) {
      return { success: false, error: "Form submission rejected" };
    }
    
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>;

    // Sanitize all string inputs BEFORE validation and destructuring so the
    // schema-validated path (which parses rawData below) and the schemaless
    // path both receive sanitized values. Previously only the formDataObj copy
    // was sanitized, while the schema branch validated/returned the raw object.
    for (const key in rawData) {
      if (typeof rawData[key] === 'string') {
        rawData[key] = sanitizeInput(rawData[key] as string);
      }
    }

    // Remove security fields from the schemaless output
    const { [CSRF_FORM_FIELD]: _, [HONEYPOT_FIELD]: __, timestamp: ___, ...formDataObj } = rawData;
    
    // Validate schema if provided
    let validatedData: T;
    if (schema) {
      const result = schema.safeParse(rawData);
      if (!result.success) {
        return { 
          success: false, 
          error: result.error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        };
      }
      validatedData = result.data;
    } else {
      validatedData = formDataObj as T;
    }
    
    // Call handler with validated data
    if (handler) {
      const result = await handler(validatedData);
      return { success: true, data: result };
    }
    
    return { success: true, data: validatedData as unknown as R };
  } catch (error) {
    // Don't log the entire error object as it may contain sensitive form data
    console.error("Secure form action error occurred");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
} 