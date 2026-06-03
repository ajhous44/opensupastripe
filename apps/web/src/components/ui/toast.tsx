'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  title?: string
  description: string
  variant?: 'default' | 'destructive'
  duration?: number
}

// Global state for toasts
type ToastState = {
  id: string
  title?: string
  description: string
  variant: 'default' | 'destructive'
  duration: number
}

const toasts: ToastState[] = []
let listeners: (() => void)[] = []

const notifyChange = () => {
  listeners.forEach(listener => listener())
}

const removeToastById = (id: string) => {
  const index = toasts.findIndex((toastItem) => toastItem.id === id)
  if (index === -1) return
  toasts.splice(index, 1)
  notifyChange()
}

export function toast({ 
  title, 
  description, 
  variant = 'default', 
  duration = 5000 
}: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  
  toasts.push({ id, title, description, variant, duration })
  notifyChange()

  // Auto-remove after duration
  setTimeout(() => {
    removeToastById(id)
  }, duration)
}

export function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const [stateToasts, setStateToasts] = useState<ToastState[]>([])

  // Listen for changes to the toasts array
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    
    const updateToasts = () => {
      setStateToasts([...toasts])
    }
    
    listeners.push(updateToasts)
    
    return () => {
      listeners = listeners.filter(listener => listener !== updateToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    removeToastById(id)
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-0 right-0 z-50 p-4 w-full md:max-w-sm">
      <div className="flex flex-col space-y-2">
        {stateToasts.map(toast => (
          <div
            key={toast.id}
            className={`rounded-lg shadow-lg p-4 flex items-start space-x-4 animate-enter ${
              toast.variant === 'destructive' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-white border border-indigo-100'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.variant === 'destructive' ? (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              {toast.title && (
                <h3 className={`text-sm font-medium ${
                  toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
                }`}>
                  {toast.title}
                </h3>
              )}
              <p className={`mt-1 text-sm ${
                toast.variant === 'destructive' ? 'text-red-700' : 'text-gray-600'
              }`}>
                {toast.description}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
} 
