// Original simple cn function (assuming this was the previous state)
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Generate optimized image URLs for Supabase images
 * This can be used with Next.js Image component to optimize loading
 * @param src - Original image URL from Supabase
 * @param width - Desired width
 * @returns Optimized image URL with size parameters
 */
export function supabaseImageLoader({ src, width }: { src: string; width: number }) {
  // Only handle Supabase URLs
  if (!src.includes('supabase.co/storage/v1/object/public')) {
    return src;
  }

  // Append width parameter to URL to fetch resized image if it's a Supabase Storage URL
  const url = new URL(src);
  url.searchParams.set('width', width.toString());
  url.searchParams.set('quality', width > 1000 ? '80' : width > 500 ? '75' : '70');
  
  // Convert to WebP if browser supports it
  if (typeof window !== 'undefined' && 
      'createImageBitmap' in window && 
      'imageBitmap' in window) {
    url.searchParams.set('format', 'webp');
  }
  
  return url.toString();
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Formatted relative time string
 */
export function timeAgo(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
} 