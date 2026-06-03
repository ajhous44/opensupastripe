'use server'

import { createClient } from '@/lib/supabase-server'
import type { Profile } from '@/types'

/**
 * Server Actions for profile operations
 * Single source of truth for profile data access
 */

// Define proper error type
interface RepositoryError {
  message: string;
  code: string;
  operation: string;
}

// Define repository response type (internal to this file)
type RepositoryResponse<T> = {
  data: T | null
  error: RepositoryError | null
}

/**
 * Handles common error patterns and provides consistent error responses
 */
function handleError(error: unknown, operation: string): RepositoryResponse<never> {
  const errorMessage = error instanceof Error ? error.message : 'Database operation failed';
  const errorCode = (error as { code?: string })?.code || 'UNKNOWN_ERROR';
  
  console.error(`Profile Action Error in ${operation}:`, error)
  return {
    data: null,
    error: {
      message: errorMessage,
      code: errorCode,
      operation
    }
  }
}

/**
 * Formats successful responses consistently
 */
function handleSuccess<T>(data: T, _operation: string): RepositoryResponse<T> {
  return {
    data,
    error: null
  }
}

/**
 * Get profile by user ID
 */
export async function getByUserId(userId: string): Promise<RepositoryResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return handleError(error, 'getByUserId')
    }

    return handleSuccess(data, 'getByUserId')
  } catch (error) {
    return handleError(error, 'getByUserId')
  }
}

/**
 * Update profile
 */
export async function update(userId: string, updates: Partial<Profile>): Promise<RepositoryResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return handleError(error, 'update')
    }

    return handleSuccess(data, 'update')
  } catch (error) {
    return handleError(error, 'update')
  }
}

/**
 * Create profile
 */
export async function create(profile: Partial<Profile>): Promise<RepositoryResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      return handleError(error, 'create')
    }

    return handleSuccess(data, 'create')
  } catch (error) {
    return handleError(error, 'create')
  }
} 