import React from 'react'
import { ToastContainer } from '@/components/ui/toast'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0 dark:bg-black/20" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
      <ToastContainer />
    </div>
  )
}
