import 'server-only'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server-admin'
import { sanitizedInsert, sanitizedUpdate } from '@/lib/supabase-sanitizer'
import type { OrganizationInfo } from '@/types'

export type RepositoryResponse<T> = {
  data: T | null
  error: {
    message: string
    code: string
    operation: string
  } | null
}

function handleError(error: any, operation: string): RepositoryResponse<any> {
  console.error(`Repository Error in ${operation}:`, error)
  return {
    data: null,
    error: {
      message: error?.message || 'Database operation failed',
      code: error?.code || 'UNKNOWN_ERROR',
      operation
    }
  }
}

function handleSuccess<T>(data: T, _operation: string): RepositoryResponse<T> {
  return {
    data,
    error: null
  }
}

async function getBySubdomainAdminFallback(subdomain: string): Promise<OrganizationInfo | null> {
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('organizations_public')
      .select('*')
      .eq('subdomain', subdomain)
      .maybeSingle()

    return data || null
  } catch {
    return null
  }
}

async function getByCustomDomainAdminFallback(customDomain: string): Promise<OrganizationInfo | null> {
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('organizations_public')
      .select('*')
      .eq('custom_domain', customDomain)
      .eq('custom_domain_verified', true)
      .maybeSingle()

    return data || null
  } catch {
    return null
  }
}

export async function getByOwner(ownerId: string): Promise<RepositoryResponse<OrganizationInfo>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', ownerId)
      .single()

    if (error) {
      return handleError(error, 'getByOwner')
    }

    return handleSuccess(data, 'getByOwner')
  } catch (error) {
    return handleError(error, 'getByOwner')
  }
}

export async function getBySubdomain(subdomain: string): Promise<RepositoryResponse<OrganizationInfo | null>> {
  try {
    const supabase = await createClient()
    
    // Set the tenant context for RLS to work properly
    await supabase.rpc('set_config', {
      parameter: 'request.subdomain',
      value: subdomain
    })
    
    const { data, error } = await supabase
      .from('organizations_public')
      .select('*')
      .eq('subdomain', subdomain)
      .maybeSingle()

    if (error) {
      const fallbackData = await getBySubdomainAdminFallback(subdomain)
      if (fallbackData) {
        return handleSuccess(fallbackData, 'getBySubdomain')
      }
      return handleError(error, 'getBySubdomain')
    }

    if (!data) {
      const fallbackData = await getBySubdomainAdminFallback(subdomain)
      if (fallbackData) {
        return handleSuccess(fallbackData, 'getBySubdomain')
      }
      return handleSuccess(null, 'getBySubdomain')
    }

    return handleSuccess(data, 'getBySubdomain')
  } catch (error) {
    return handleError(error, 'getBySubdomain')
  }
}

export async function getByCustomDomain(customDomain: string): Promise<RepositoryResponse<OrganizationInfo | null>> {
  try {
    const supabase = await createClient()
    
    // Set the tenant context for RLS to work properly
    await supabase.rpc('set_config', {
      parameter: 'request.custom_domain',
      value: customDomain
    })
    
    const { data, error } = await supabase
      .from('organizations_public')
      .select('*')
      .eq('custom_domain', customDomain)
      .eq('custom_domain_verified', true)
      .maybeSingle()

    if (error) {
      const fallbackData = await getByCustomDomainAdminFallback(customDomain)
      if (fallbackData) {
        return handleSuccess(fallbackData, 'getByCustomDomain')
      }
      return handleError(error, 'getByCustomDomain')
    }

    if (!data) {
      const fallbackData = await getByCustomDomainAdminFallback(customDomain)
      if (fallbackData) {
        return handleSuccess(fallbackData, 'getByCustomDomain')
      }
      return handleSuccess(null, 'getByCustomDomain')
    }

    return handleSuccess(data, 'getByCustomDomain')
  } catch (error) {
    return handleError(error, 'getByCustomDomain')
  }
}

export async function create(organization: OrganizationInfo): Promise<RepositoryResponse<OrganizationInfo>> {
  try {
    const supabase = await createClient()
    const { data, error } = await sanitizedInsert(supabase, 'organizations', organization as unknown as Record<string, unknown>)
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

export async function update(id: string, updates: Partial<OrganizationInfo>): Promise<RepositoryResponse<OrganizationInfo>> {
  try {
    const supabase = await createClient()
    const { data, error } = await sanitizedUpdate(supabase, 'organizations', updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return handleError(error, 'update')
    }

    return handleSuccess(data, 'update')
  } catch (error) {
    return handleError(error, 'update')
  }
}

export async function getById(id: string): Promise<RepositoryResponse<OrganizationInfo | null>> {
  try {
    const supabase = await createClient()
    
    // Note: getById is typically used by authenticated users, so we may not need tenant context
    // But we'll include it for consistency in case it's used from public pages
    const { data, error } = await supabase
      .from('organizations_public')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return handleError(error, 'getById')
    }

    if (!data) {
      return handleSuccess(null, 'getById')
    }

    return handleSuccess(data, 'getById')
  } catch (error) {
    return handleError(error, 'getById')
  }
}

export async function getDomainInfo(
  organizationId: string,
  ownerId: string
): Promise<RepositoryResponse<{ custom_domain: string | null; custom_domain_verified: boolean }>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('custom_domain, custom_domain_verified')
      .eq('id', organizationId)
      .eq('owner_id', ownerId)
      .single()

    if (error) {
      return handleError(error, 'getDomainInfo')
    }

    return handleSuccess(data, 'getDomainInfo')
  } catch (error) {
    return handleError(error, 'getDomainInfo')
  }
}

export async function setCustomDomain(
  organizationId: string,
  ownerId: string,
  domain: string
): Promise<RepositoryResponse<{ custom_domain: string | null; custom_domain_verified: boolean }>> {
  try {
    const supabase = await createClient()
    const { data, error } = await sanitizedUpdate(supabase, 'organizations', {
      custom_domain: domain,
      custom_domain_verified: false,
    })
      .eq('id', organizationId)
      .eq('owner_id', ownerId)
      .select('custom_domain, custom_domain_verified')
      .single()

    if (error) {
      return handleError(error, 'setCustomDomain')
    }

    return handleSuccess(data, 'setCustomDomain')
  } catch (error) {
    return handleError(error, 'setCustomDomain')
  }
}

export async function removeCustomDomain(
  organizationId: string,
  ownerId: string
): Promise<RepositoryResponse<{ custom_domain: string | null; custom_domain_verified: boolean }>> {
  try {
    const supabase = await createClient()
    // Fetch current domain first so we can return it
    const { data: current, error: fetchError } = await supabase
      .from('organizations')
      .select('custom_domain, custom_domain_verified')
      .eq('id', organizationId)
      .eq('owner_id', ownerId)
      .single()
    if (fetchError) {
      return handleError(fetchError, 'removeCustomDomain:fetch')
    }

    const { error: updateError } = await sanitizedUpdate(supabase, 'organizations', {
      custom_domain: null,
      custom_domain_verified: false,
    })
      .eq('id', organizationId)
      .eq('owner_id', ownerId)

    if (updateError) {
      return handleError(updateError, 'removeCustomDomain:update')
    }

    return handleSuccess(current, 'removeCustomDomain')
  } catch (error) {
    return handleError(error, 'removeCustomDomain')
  }
}

export async function updateDomainVerification(
  organizationId: string,
  ownerId: string,
  isVerified: boolean
): Promise<RepositoryResponse<{ custom_domain: string | null; custom_domain_verified: boolean }>> {
  try {
    const supabase = await createClient()
    const { data, error } = await sanitizedUpdate(supabase, 'organizations', {
      custom_domain_verified: isVerified,
    })
      .eq('id', organizationId)
      .eq('owner_id', ownerId)
      .select('custom_domain, custom_domain_verified')
      .single()

    if (error) {
      return handleError(error, 'updateDomainVerification')
    }

    return handleSuccess(data, 'updateDomainVerification')
  } catch (error) {
    return handleError(error, 'updateDomainVerification')
  }
}
