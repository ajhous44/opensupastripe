"use client"

import React, { forwardRef, useRef } from "react"
import { Laptop, Smartphone, Mic, MapPin, Globe, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/ui/animated-beam"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 p-3 shadow-sm dark:shadow-[0_0_20px_-12px_rgba(255,255,255,0.3)] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-3xl bg-gray-100 dark:bg-black/50 p-10"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[200px] max-w-lg flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Icons.google />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.trendingUp />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Icons.laptop />
          </Circle>
          <Circle ref={div4Ref} className="size-16 !bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400">
            <Icons.hub />
          </Circle>
          <Circle ref={div6Ref}>
            <Icons.mic />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Icons.smartphone />
          </Circle>
          <Circle ref={div7Ref}>
            <Icons.mapPin />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  )
}

const Icons = {
  google: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  hub: () => (
    <Globe className="h-6 w-6 text-white" />
  ),
  laptop: () => (
    <Laptop className="h-6 w-6 text-blue-500" />
  ),
  trendingUp: () => (
    <TrendingUp className="h-6 w-6 text-[#008373]" />
  ),
  mic: () => (
    <Mic className="h-6 w-6 text-emerald-500" />
  ),
  smartphone: () => (
    <Smartphone className="h-6 w-6 text-indigo-500" />
  ),
  mapPin: () => (
    <MapPin className="h-6 w-6 text-amber-500" />
  ),
}

export default AnimatedBeamDemo
