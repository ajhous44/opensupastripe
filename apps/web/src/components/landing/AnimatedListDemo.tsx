"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/ui/animated-list"

interface Item {
  id: string
  name: string
  description: string
  icon: string
  color: string
  time: string
}

const events = [
  { name: "Invite accepted", description: "alex@acme.com joined as Admin", icon: "👥", color: "#1E86FF" },
  { name: "Subscription active", description: "Pro plan activated via Stripe", icon: "💳", color: "#00C9A7" },
  { name: "Organization created", description: "Northwind workspace provisioned", icon: "🏢", color: "#7C3AED" },
  { name: "Invite sent", description: "Pending invite to jamie@brightside.io", icon: "✉️", color: "#FFB800" },
  { name: "Webhook received", description: "customer.subscription.updated", icon: "⚡", color: "#06B6D4" },
  { name: "Profile updated", description: "Owner changed organization settings", icon: "⚙️", color: "#FF3D71" },
]

const times = ["2m ago", "5m ago", "8m ago", "12m ago", "15m ago", "20m ago"]

const notifications = Array.from({ length: 8 }, (_, cycleIndex) =>
  events.map((event, eventIndex) => ({
    ...event,
    id: `${cycleIndex}-${event.name}-${eventIndex}`,
    time: times[eventIndex % times.length],
  }))
).flat()

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "transform-gpu bg-transparent backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center text-lg font-medium whitespace-pre text-gray-900 dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-gray-600 dark:text-white/60">{description}</p>
        </div>
      </div>
    </figure>
  )
}

export default function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-[500px] w-full flex-col overflow-hidden p-2", className)}>
      <AnimatedList>
        {notifications.map((item) => (
          <Notification key={item.id} {...item} />
        ))}
      </AnimatedList>
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t" />
    </div>
  )
}
