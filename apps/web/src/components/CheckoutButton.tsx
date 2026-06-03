'use client'

import { useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase-config'

type CheckoutButtonProps = {
  children: React.ReactNode
  className?: string
}

export default function CheckoutButton({ children, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isSupabaseConfigured()) {
      alert('Configure Supabase and Stripe env vars to enable checkout.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch {
      alert('Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Loading...' : children}
    </button>
  )
}
