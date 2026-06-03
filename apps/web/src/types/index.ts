export interface OrganizationInfo {
  id: string
  name: string
  subdomain: string
  custom_domain?: string
  custom_domain_verified?: boolean
  logo_url?: string
  subscription_status?: string | null
  created_at?: string
  updated_at?: string
  owner_id?: string
}

export interface TeamMember {
  id: string
  user_id: string
  organization_id: string
  role: 'admin' | 'staff'
  accepted_at?: string | null
  created_at?: string
  updated_at?: string
  user?: {
    id: string
    email: string
  }
}

export interface OrganizationMembership {
  organization: OrganizationInfo
  role: 'owner' | 'admin' | 'staff'
}

export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'staff'
  token: string
  invited_by: string
  expires_at: string
  accepted_at?: string | null
  created_at: string
  organization?: OrganizationInfo
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SectionProps {
  as?: React.ElementType
  bgImage?: string
  overlayOpacity?: number
  className?: string
  children: React.ReactNode
  [key: string]: unknown
}

export interface Profile {
  id: string
  full_name?: string | null
  avatar_url?: string | null
  email?: string | null
  phone?: string | null
  created_at?: string
  updated_at?: string
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
}
