"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
      <SliderPrimitive.Range 
        className="absolute h-full bg-gray-400"
        style={{
          left: 'var(--radix-slider-range-start)',
          right: 'var(--radix-slider-range-end)',
        }}
      />
    </SliderPrimitive.Track>
    {/* Render two thumbs if value is an array, otherwise one */}
    {(Array.isArray(props.value) ? props.value : [props.value || 0]).map((_value: number, i: number) => (
      <SliderPrimitive.Thumb
        key={i}
        className={cn(
          "block h-5 w-5 rounded-full border-2 border-primary bg-black fill-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        )}
      />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 