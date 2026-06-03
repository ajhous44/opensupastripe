'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Detect if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    // Detect if it's already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true

    Promise.resolve().then(() => {
      setIsIOS(iOS)
      setIsStandalone(standalone)
    })

    // Show iOS prompt if it's iOS, not standalone, and user hasn't dismissed it
    if (iOS && !standalone && !localStorage.getItem('pwa-prompt-dismissed')) {
      // Delay showing the prompt slightly for better UX
      setTimeout(() => setShowIOSPrompt(true), 2000)
    }

    // Listen for Android install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      if (!localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => setShowAndroidPrompt(true), 2000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowAndroidPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    setShowIOSPrompt(false)
    setShowAndroidPrompt(false)
  }

  // Don't show anything if already installed
  if (isStandalone) {
    return null
  }

  // iOS Install Prompt
  if (showIOSPrompt && isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Install My Company</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          Add My Company to your home screen for quick access to your organization dashboard.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">1</span>
            </div>
            <span className="text-gray-700">
              Tap the <Share className="inline h-4 w-4 mx-1" /> share button below
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">2</span>
            </div>
            <span className="text-gray-700">
              Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> "Add to Home Screen"
            </span>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Got it
        </button>
      </div>
    )
  }

  // Android Install Prompt
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Install My Company</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          Install My Company for quick access and a native app experience.
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-700 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  return null
} 
