/**
 * Utility functions for server-side input sanitization
 */
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  return DOMPurify.sanitize(String(input), {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [] // Strip all attributes
  });
}

/**
 * Sanitizes a text input that might contain some allowed formatting
 * @param input String to sanitize
 * @returns Sanitized string with basic formatting preserved
 */
export function sanitizeFormattedText(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  return DOMPurify.sanitize(String(input), {
    ALLOWED_TAGS: ['p', 'br'], // Allow only paragraphs and line breaks
    ALLOWED_ATTR: [] // Strip all attributes
  });
}

/**
 * Sanitizes a number input
 * @param input Number to sanitize
 * @returns Sanitized number or default value if invalid
 */
export function sanitizeNumber(input: unknown, defaultValue: number = 0): number {
  const num = Number(input);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Sanitizes a URL input
 * @param input URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  
  try {
    // Try to parse the URL to validate it
    const url = new URL(String(input));
    
    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    
    return DOMPurify.sanitize(url.toString());
  } catch {
    // If URL is invalid, return empty string
    return '';
  }
}

/**
 * Sanitizes an email address
 * @param input Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  
  const email = String(input).trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }
  
  return email;
}

/**
 * Sanitizes a phone number, removing all non-digit characters
 * @param input Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  
  // Remove all non-digit characters
  return String(input).replace(/\D/g, '');
}

/**
 * Sanitizes an object by applying the appropriate sanitization function to each property
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : 
          typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
          item
        );
      } else {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
} 