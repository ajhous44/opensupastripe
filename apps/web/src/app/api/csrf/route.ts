import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/form-security';

/**
 * API route that generates a CSRF token and sets it in a cookie
 * Used by client components to securely get a CSRF token
 */
export async function GET() {
  // Generate token and set cookie (function handles cookie setting)
  const token = await generateCsrfToken();
  
  // Return token to client to be included in forms
  return NextResponse.json({ token });
} 