'use server'

import * as organizationRepo from '@/lib/repositories/organization'
import { OrganizationCreateSchema } from '@/lib/validation/schemas'
import { createValidatedAction } from '@/lib/validation/server-action-wrapper'
import type { OrganizationInfo } from '@/types'

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
