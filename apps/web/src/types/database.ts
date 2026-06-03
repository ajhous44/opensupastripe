export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
          last_modified_by: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          subdomain: string
          logo_url: string | null
          owner_id: string | null
          custom_domain: string | null
          custom_domain_verified: boolean | null
          subscription_status: string | null
          subscription_expires_at: string | null
          created_at: string | null
          updated_at: string | null
          last_modified_by: string | null
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          logo_url?: string | null
          owner_id?: string | null
          custom_domain?: string | null
          custom_domain_verified?: boolean | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          logo_url?: string | null
          owner_id?: string | null
          custom_domain?: string | null
          custom_domain_verified?: boolean | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: string
          created_at: string | null
          updated_at: string | null
          last_modified_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role: string
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: string
          created_at?: string | null
          updated_at?: string | null
          last_modified_by?: string | null
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: string
          token: string
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role: string
          token: string
          invited_by: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: string
          token?: string
          invited_by?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          stripe_product_id: string
          stripe_price_id: string
          name: string
          description: string | null
          price_cents: number
          currency: string
          billing_interval: string
          billing_interval_count: number
          trial_days: number | null
          sort_order: number | null
          is_active: boolean
          features: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          stripe_product_id: string
          stripe_price_id: string
          name: string
          description?: string | null
          price_cents: number
          currency?: string
          billing_interval: string
          billing_interval_count?: number
          trial_days?: number | null
          sort_order?: number | null
          is_active?: boolean
          features?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          stripe_product_id?: string
          stripe_price_id?: string
          name?: string
          description?: string | null
          price_cents?: number
          currency?: string
          billing_interval?: string
          billing_interval_count?: number
          trial_days?: number | null
          sort_order?: number | null
          is_active?: boolean
          features?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          stripe_subscription_id: string
          stripe_invoice_id: string | null
          stripe_customer_id: string
          organization_id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancelled_at: string | null
          price_cents: number
          currency: string
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          stripe_subscription_id: string
          stripe_invoice_id?: string | null
          stripe_customer_id: string
          organization_id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancelled_at?: string | null
          price_cents: number
          currency?: string
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          stripe_subscription_id?: string
          stripe_invoice_id?: string | null
          stripe_customer_id?: string
          organization_id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancelled_at?: string | null
          price_cents?: number
          currency?: string
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          id: string
          event_name: string
          stripe_subscription_id: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
          webhook_data: Json
          processed: boolean
          processed_at: string | null
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          event_name: string
          stripe_subscription_id?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          webhook_data: Json
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          event_name?: string
          stripe_subscription_id?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          webhook_data?: Json
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      organizations_public: {
        Row: {
          id: string
          name: string
          subdomain: string
          custom_domain: string | null
          custom_domain_verified: boolean | null
          logo_url: string | null
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          organization_id: string
          organization_name: string
          subdomain: string
          subscription_id: string | null
          subscription_status: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          plan_name: string | null
          price_cents: number | null
          currency: string | null
          billing_interval: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      set_config: {
        Args: { parameter: string; value: string }
        Returns: undefined
      }
      check_subdomain_exists: {
        Args: { p_subdomain: string }
        Returns: boolean
      }
      can_add_team_member: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      get_team_member_count: {
        Args: { p_organization_id: string }
        Returns: number
      }
      get_organization_team_members: {
        Args: { p_organization_id: string }
        Returns: {
          id: string
          user_id: string
          organization_id: string
          role: string
          created_at: string | null
          updated_at: string | null
          email: string
        }[]
      }
      get_organization_for_invite: {
        Args: { p_invite_token: string }
        Returns: {
          id: string
          name: string
          subdomain: string
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
