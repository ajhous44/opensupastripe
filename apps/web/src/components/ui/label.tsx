import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string
  htmlFor?: string
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        className={`block text-sm font-medium text-gray-900 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    )
  }
)

Label.displayName = 'Label' 