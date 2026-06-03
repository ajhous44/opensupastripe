'use server'

import * as organizationRepo from '@/lib/repositories/organization'
import { OrganizationCreateSchema } from '@/lib/validation/schemas'
import { createValidatedAction } from '@/lib/validation/server-action-wrapper'
import type { OrganizationInfo } from '@/types'

/**
 * Get organization by owner ID
 */
export async function getByOwner(userId: string) {
  return organizationRepo.getByOwner(userId)
}

export async function getBySubdomain(subdomain: string) {
  return organizationRepo.getBySubdomain(subdomain)
}

export async function getByCustomDomain(customDomain: string) {
  return organizationRepo.getByCustomDomain(customDomain)
}

export async function getById(id: string) {
  return organizationRepo.getById(id)
}

export async function update(id: string, updates: Partial<OrganizationInfo>) {
  return organizationRepo.update(id, updates)
}

export async function getDomainInfo(organizationId: string, ownerId: string) {
  return organizationRepo.getDomainInfo(organizationId, ownerId)
}

export async function setCustomDomain(organizationId: string, ownerId: string, domain: string) {
  return organizationRepo.setCustomDomain(organizationId, ownerId, domain)
}

export async function removeCustomDomain(organizationId: string, ownerId: string) {
  return organizationRepo.removeCustomDomain(organizationId, ownerId)
}

export async function updateDomainVerification(organizationId: string, ownerId: string, isVerified: boolean) {
  return organizationRepo.updateDomainVerification(organizationId, ownerId, isVerified)
}

/**
 * Create a new organization
 */
export const createOrganization = createValidatedAction(
  OrganizationCreateSchema,
  async (data, context) => {
    // Ensure new organizations can be created by users without an existing organization
    // and stamp the record with the authenticated owner_id
    const payload: OrganizationInfo = {
      ...(data as OrganizationInfo),
      owner_id: context.userId,
    }

    const result = await organizationRepo.create(payload)
    
    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    return {
      success: true,
      data: result.data,
    }
  },
  {
    requireOrganization: false,
  }
)