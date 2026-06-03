"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface PaymentPreferences {
  downPayment: number
  apr: number
  termMonths: number
}

export const DEFAULT_PAYMENT_PREFERENCES: PaymentPreferences = {
  downPayment: 0,
  apr: 6.5,
  termMonths: 60,
}

const STORAGE_KEY = "supastripe-payment-preferences"

function readStoredPaymentPreferences(): {
  preferences: PaymentPreferences
  hasStored: boolean
} {
  if (typeof window === "undefined") {
    return { preferences: DEFAULT_PAYMENT_PREFERENCES, hasStored: false }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<PaymentPreferences>
      return {
        preferences: {
          ...DEFAULT_PAYMENT_PREFERENCES,
          ...sanitizePaymentPreferences(parsed),
        },
        hasStored: true,
      }
    }
  } catch (error) {
    console.warn("[usePaymentPreferences] Failed to read stored preferences", error)
  }

  return { preferences: DEFAULT_PAYMENT_PREFERENCES, hasStored: false }
}

export function usePaymentPreferences() {
  const [preferences, setPreferences] = useState<PaymentPreferences>(
    () => readStoredPaymentPreferences().preferences,
  )
  const [isLoaded] = useState(() => typeof window !== "undefined")
  const [hasStoredPreferences, setHasStoredPreferences] = useState(
    () => readStoredPaymentPreferences().hasStored,
  )
  const isWriting = useRef(false)

  // Synchronize across tabs
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return
      }

      if (!event.newValue) {
        setPreferences(DEFAULT_PAYMENT_PREFERENCES)
        setHasStoredPreferences(false)
        return
      }

      try {
        const parsed = JSON.parse(event.newValue) as Partial<PaymentPreferences>
        setPreferences((current) => ({ ...current, ...sanitizePaymentPreferences(parsed) }))
        setHasStoredPreferences(true)
      } catch (error) {
        console.warn("[usePaymentPreferences] Failed to parse storage event", error)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const persist = useCallback((next: PaymentPreferences) => {
    if (typeof window === "undefined") {
      return
    }

    try {
      isWriting.current = true
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setHasStoredPreferences(true)
    } catch (error) {
      console.warn("[usePaymentPreferences] Failed to store preferences", error)
    } finally {
      isWriting.current = false
    }
  }, [])

  const updatePreferences = useCallback((updates: Partial<PaymentPreferences>) => {
    setPreferences((prev) => {
      const merged = sanitizePaymentPreferences({ ...prev, ...updates })
      // Avoid double writes when state update triggered by storage event
      if (!isWriting.current) {
        persist(merged)
      }
      return merged
    })
  }, [persist])

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PAYMENT_PREFERENCES)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setHasStoredPreferences(false)
  }, [])

  return {
    preferences,
    isLoaded,
    hasStoredPreferences,
    updatePreferences,
    resetPreferences,
  }
}

export function sanitizePaymentPreferences(input: Partial<PaymentPreferences>): PaymentPreferences {
  const downPayment = normalizeNumber(input.downPayment, DEFAULT_PAYMENT_PREFERENCES.downPayment, { min: 0 })
  const apr = normalizeNumber(input.apr, DEFAULT_PAYMENT_PREFERENCES.apr, { min: 0, max: 40 })
  const termMonths = normalizeNumber(input.termMonths, DEFAULT_PAYMENT_PREFERENCES.termMonths, { min: 12, max: 96 })

  return {
    downPayment,
    apr,
    termMonths,
  }
}

function normalizeNumber(
  value: number | undefined,
  fallback: number,
  { min, max }: { min?: number; max?: number } = {},
): number {
  if (!Number.isFinite(value)) {
    return fallback
  }

  let result = Number(value)
  if (typeof min === "number" && result < min) {
    result = min
  }
  if (typeof max === "number" && result > max) {
    result = max
  }
  return Math.round(result * 100) / 100
}

