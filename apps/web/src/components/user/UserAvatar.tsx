'use client';

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ size = 'md', className = '' }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadUserAvatar() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('[UserAvatar] Error fetching user:', error)
          setIsLoading(false)
          return
        }
        
        const { user } = data
        
        if (!user) {
          setIsLoading(false)
          return
        }
        
        // Check for profile picture in user_metadata
        // Google stores it as 'picture', other providers might use 'avatar_url'
        const originalUrl = user?.user_metadata?.avatar_url || 
                           user?.user_metadata?.picture || 
                           null
        
        if (originalUrl) {
          // Use our proxy for external URLs, particularly for Google profile images
          if (originalUrl.includes('googleusercontent.com')) {
            const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
            setAvatarUrl(proxiedUrl)
          } else {
            setAvatarUrl(originalUrl)
          }
        }
      } catch (error) {
        console.error('[UserAvatar] Error loading user avatar:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserAvatar()
  }, [])
  
  // Size classes mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }
  
  return (
    <div className={`relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {isLoading ? (
        // Loading state
        <div className="animate-pulse bg-gray-300 w-full h-full"></div>
      ) : avatarUrl ? (
        // User has a profile picture
        <Image 
          src={avatarUrl} 
          alt="User avatar" 
          fill 
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
          className="object-cover"
          onError={() => {
            console.error('[UserAvatar] Image loading error for URL:', avatarUrl)
            setAvatarUrl(null)
          }}
        />
      ) : (
        // Default avatar icon
        <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize[size]} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </div>
  )
} 