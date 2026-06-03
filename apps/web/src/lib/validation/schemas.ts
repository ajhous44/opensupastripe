import { z } from 'zod'

export const uuidSchema = z.string().uuid('Invalid ID format')
export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/i, 'Invalid slug format')

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain too long')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .refine(s => !s.startsWith('-') && !s.endsWith('-'), 'Subdomain cannot start or end with hyphen')
    .refine(s => !['www', 'app', 'api', 'admin', 'supastripe'].includes(s), 'Reserved subdomain'),
})

export const OrganizationUpdateSchema = OrganizationCreateSchema.partial().extend({
  id: uuidSchema.optional(),
})

export const ProfileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name required').max(50, 'First name too long').trim().optional(),
  last_name: z.string().min(1, 'Last name required').max(50, 'Last name too long').trim().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,20}$/, 'Invalid phone format').optional().or(z.literal('')),
  avatar_url: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
})

export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(20),
})

export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>
export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>
