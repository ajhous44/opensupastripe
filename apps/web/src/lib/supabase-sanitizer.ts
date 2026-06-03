/**
 * Supabase operation wrappers with built-in sanitization
 * These functions ensure all user inputs are sanitized before being sent to the database
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeObject, sanitizeString } from './sanitize';

type Client = SupabaseClient<any, 'public', any>;

/**
 * Wrapper for Supabase insert operations with sanitization
 * @param supabase Supabase client instance
 * @param table Table name
 * @param data Data to insert (will be sanitized)
 * @returns Supabase query builder with sanitized data
 */
export function sanitizedInsert<T extends Record<string, unknown>>(
  supabase: Client,
  table: string,
  data: T | T[]
) {
  // Handle both single object and array of objects
  const sanitizedData = Array.isArray(data)
    ? data.map(item => sanitizeObject(item))
    : sanitizeObject(data);
  
  // Return the insert operation with sanitized data
  return supabase.from(table).insert(sanitizedData as never);
}

/**
 * Wrapper for Supabase update operations with sanitization
 * @param supabase Supabase client instance
 * @param table Table name
 * @param data Data to update (will be sanitized)
 * @returns Supabase query builder with sanitized data
 */
export function sanitizedUpdate<T extends Record<string, unknown>>(
  supabase: Client,
  table: string,
  data: T
) {
  // Return the update operation with sanitized data
  return supabase.from(table).update(sanitizeObject(data) as never);
}

/**
 * Wrapper for Supabase upsert operations with sanitization
 * @param supabase Supabase client instance
 * @param table Table name
 * @param data Data to upsert (will be sanitized)
 * @returns Supabase query builder with sanitized data
 */
export function sanitizedUpsert<T extends Record<string, unknown>>(
  supabase: Client,
  table: string,
  data: T | T[]
) {
  // Handle both single object and array of objects
  const sanitizedData = Array.isArray(data)
    ? data.map(item => sanitizeObject(item))
    : sanitizeObject(data);
  
  // Return the upsert operation with sanitized data
  return supabase.from(table).upsert(sanitizedData as never);
}

/**
 * Wrapper for Supabase select operations with sanitized filters
 * @param supabase Supabase client instance
 * @param table Table name
 * @param column Column to filter (optional)
 * @param value Value to filter by (will be sanitized)
 * @returns Supabase query builder with sanitized parameters
 */
export function sanitizedSelect(
  supabase: Client,
  table: string,
  column?: string,
  value?: string
) {
  const query = supabase.from(table).select('*');
  
  // If column and value are provided, apply a sanitized filter
  if (column && value !== undefined) {
    return query.eq(column, sanitizeString(value));
  }
  
  return query;
}

/**
 * Creates a sanitized RPC call
 * @param supabase Supabase client instance
 * @param functionName Name of the RPC function
 * @param params Parameters to pass (will be sanitized)
 * @returns Supabase RPC call with sanitized parameters
 */
export function sanitizedRpc<T extends Record<string, unknown>>(
  supabase: Client,
  functionName: string,
  params: T
) {
  return supabase.rpc(functionName, sanitizeObject(params));
} 