import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { sanitizeObject } from '@/lib/sanitize'

/**
 * DRY Server Action Validation Wrapper for Multitenant SaaS
 * Provides consistent validation, tenant isolation, and error handling
 */

export interface ServerActionResult<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface ActionContext {
  user: any // Supabase user object
  userId: string
  organizationId?: string // For tenant-aware actions
}

/**
 * Converts FormData to a plain object, handling multiple values and type conversion
 */
function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {}
  
  // Fields that should always be arrays, even with single values
  const arrayFields = new Set(['features', 'images'])
  const numericFields = new Set(['year', 'price', 'mileage', 'doors', 'page', 'limit'])
  
  for (const [key, value] of formData.entries()) {
    if (obj[key]) {
      // Handle multiple values (convert to array)
      if (Array.isArray(obj[key])) {
        obj[key].push(value)
      } else {
        obj[key] = [obj[key], value]
      }
    } else {
      // Try to convert strings to appropriate types
      if (typeof value === 'string') {
        // Convert string numbers to numbers
        if (numericFields.has(key) && /^\d+$/.test(value)) {
          obj[key] = parseInt(value, 10)
        } else if (numericFields.has(key) && /^\d*\.\d+$/.test(value)) {
          obj[key] = parseFloat(value)
        } else if (value === 'true') {
          obj[key] = true
        } else if (value === 'false') {
          obj[key] = false
        } else if (value === '') {
          // Don't set undefined for required fields - let validation handle it
          obj[key] = value
        } else {
          obj[key] = value
        }
      } else {
        obj[key] = value
      }
    }
  }
  
  // Ensure array fields are always arrays (even if single value or empty)
  for (const arrayField of arrayFields) {
    if (arrayField in obj && !Array.isArray(obj[arrayField])) {
      obj[arrayField] = [obj[arrayField]]
    }
  }
  
  return obj
}

/**
 * Gets user's organization ID for tenant isolation
 */
async function getUserOrganizationId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', userId)
    .single()
    
  if (error || !organization) {
    return null
  }
  
  return organization.id
}

/**
 * Main validation wrapper for server actions
 * 
 * @param schema - Zod schema for input validation
 * @param handler - The actual server action handler
 * @param options - Additional options
 */
export function createValidatedAction<TInput extends Record<string, any>, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (data: TInput, context: ActionContext) => Promise<ServerActionResult<TOutput>>,
  options: {
    requireAuth?: boolean
    requireOrganization?: boolean
    allowCrossTenant?: boolean // For admin actions
  } = {}
) {
  const {
    requireAuth = true,
    requireOrganization = true,
    allowCrossTenant = false
  } = options

  return async function(formData: FormData): Promise<ServerActionResult<TOutput>> {
    try {
      // Step 1: Authentication check
      let user = null
      let userId = ''
      
      if (requireAuth) {
        const supabase = await createClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return {
            success: false,
            error: 'Authentication required'
          }
        }
        
        user = authUser
        userId = authUser.id
      }

      // Step 2: Get organization context for tenant isolation
      let organizationId: string | undefined
      
      if (requireOrganization && userId) {
        organizationId = await getUserOrganizationId(userId) || undefined
        
        if (!organizationId) {
          return {
            success: false,
            error: 'No organization found for user'
          }
        }
      }

      // Step 3: Convert FormData to object and validate
      const rawData = formDataToObject(formData)
      
      // Remove CSRF and security fields (prefixed with _ to indicate intentionally unused)
      const { csrf_token: _csrf_token, honeypot: _honeypot, timestamp: _timestamp, ...cleanData } = rawData
      
      // Validate with schema
      const validationResult = schema.safeParse(cleanData)
      
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ')
          
        return {
          success: false,
          error: `Validation error: ${errorMessage}`
        }
      }

      const validatedData = validationResult.data

      // Step 3b: Sanitize the validated data
      const sanitizedData = sanitizeObject(validatedData)

      // Step 4: Tenant isolation check
      if (requireOrganization && !allowCrossTenant && organizationId) {
        // Ensure the data being operated on belongs to the user's organization
        const dataObj = sanitizedData as Record<string, any>
        
        if ('organization_id' in dataObj) {
          const dataOrganizationId = dataObj.organization_id
          
          if (dataOrganizationId && dataOrganizationId !== organizationId) {
            return {
              success: false,
              error: 'Access denied: Cross-tenant operation not allowed'
            }
          }
        }
        
        // Auto-inject organization_id if not provided
        if ('organization_id' in dataObj && !dataObj.organization_id) {
          dataObj.organization_id = organizationId
        }
      }

      // Step 5: Create action context
      const context: ActionContext = {
        user,
        userId,
        organizationId
      }

      // Step 6: Call the actual handler
      return await handler(sanitizedData as TInput, context)

    } catch (error) {
      console.error('Server action error:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}

/**
 * Convenience wrapper for actions that don't require validation
 * But still need auth and tenant isolation
 */
export function createSecureAction<TOutput>(
  handler: (context: ActionContext) => Promise<ServerActionResult<TOutput>>,
  options: {
    requireAuth?: boolean
    requireOrganization?: boolean
  } = {}
) {
  // Use a minimal schema that accepts any data
  const schema = z.any()
  
  return createValidatedAction(
    schema,
    async (_, context) => handler(context),
    options
  )
}

/**
 * Helper for read-only actions (like fetching data)
 */
export function createReadAction<TOutput>(
  handler: (context: ActionContext) => Promise<ServerActionResult<TOutput>>
) {
  return createSecureAction(handler, {
    requireAuth: true,
    requireOrganization: true
  })
}

/**
 * Helper for creating a simple success response
 */
export function createSuccessResponse<T>(data: T): ServerActionResult<T> {
  return {
    success: true,
    data
  }
}

/**
 * Helper for creating an error response
 */
export function createErrorResponse(error: string): ServerActionResult {
  return {
    success: false,
    error
  }
} 