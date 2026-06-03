import React from 'react'
import { cn } from '@/lib/utils'
import type { ButtonProps } from '@/types'

const buttonVariants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  link: 'bg-transparent hover:bg-transparent text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline border-transparent shadow-none p-0 h-auto',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    children,
    asChild = false,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const buttonClasses = cn(
      // Base styles
      variant !== 'link' && 'inline-flex items-center justify-center rounded-md border shadow-sm font-medium',
      variant === 'link' && 'inline-flex items-center justify-center font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      'transition-colors duration-200',
      // Variant styles
      buttonVariants[variant],
      // Size styles
      variant !== 'link' && buttonSizes[size],
      // Disabled state
      isDisabled && 'opacity-50 cursor-not-allowed',
      className
    )

    if (asChild) {
      return <>{children}</>
    }

    return (
      <button
        className={buttonClasses}
        disabled={isDisabled}
        ref={ref}
        {...(props as any)}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button' 