'use server'

import { z } from 'zod'
import { createValidatedAction } from '@/lib/validation/server-action-wrapper'
import { createClient } from '@/lib/supabase-server'
import { sendSignupWelcomeEmail } from '@/lib/email/signup-welcome'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signup = createValidatedAction(
  signupSchema,
  async (data) => {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    await sendSignupWelcomeEmail({ to: data.email })

    return {
      success: true,
    }
  },
  {
    requireAuth: false,
    requireOrganization: false,
  }
)

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const login = createValidatedAction(
    loginSchema,
    async (data) => {
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (error) {
            return {
                success: false,
                error: error.message,
            }
        }

        return {
            success: true,
        }
    },
    {
        requireAuth: false,
        requireOrganization: false,
    }
)
