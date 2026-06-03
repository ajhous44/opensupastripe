"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

interface SelectItemProps {
  className?: string
  children: React.ReactNode
  value: string
}

interface SelectValueProps {
  placeholder: string
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

export function Select({ value, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative inline-block w-full", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      onClick={() => setOpen(!open)}
    >
      {children}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 opacity-50" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className="block truncate">
      {value || placeholder}
    </span>
  )
}

export function SelectContent({ className, children }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({ className, children, value: itemValue }: SelectItemProps) {
  const { value, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = value === itemValue
  
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100",
        isSelected && "bg-gray-100 font-medium",
        className
      )}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className={cn("pl-6")}>{children}</span>
    </div>
  )
}

export const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="px-1 py-1">{children}</div>
)

export const SelectLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-3 py-1.5 text-sm font-semibold", className)}>{children}</div>
)

export const SelectSeparator = ({ className }: { className?: string }) => (
  <div className={cn("my-1 h-px bg-gray-200", className)} />
) 