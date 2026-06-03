"use client"

import { FileTextIcon } from "@radix-ui/react-icons"
import { CreditCard, ShieldCheck, Users, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import SimpleBeamDemo from "@/components/landing/SimpleBeamDemo"
import AnimatedListDemo from "@/components/landing/AnimatedListDemo"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"

const workspaces = [
  { name: "Acme Labs", plan: "Pro", members: 8 },
  { name: "Northwind Co", plan: "Starter", members: 3 },
  { name: "Brightside", plan: "Pro", members: 12 },
  { name: "Pixel Foundry", plan: "Starter", members: 2 },
  { name: "Summit Apps", plan: "Enterprise", members: 24 },
]

const features = [
  {
    Icon: FileTextIcon,
    name: "Multitenant workspaces",
    description: "Each organization gets isolated data, settings, and billing context.",
    href: "/features/multitenant-workspaces",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {workspaces.map((ws) => (
          <div
            key={ws.name}
            className={cn(
              "relative w-48 cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 shadow-lg",
              "border-gray-200/50 hover:border-gray-300",
              "transform-gpu transition-all duration-300 ease-out hover:shadow-xl"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{ws.plan}</span>
              <span className="text-xs text-gray-500">{ws.members} members</span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-gray-900">{ws.name}</h4>
            <p className="mt-1 text-xs text-gray-600">workspace.localhost:3000</p>
          </div>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Users,
    name: "Team invites & roles",
    description: "Owner, admin, and staff access with secure accept-invite flows.",
    href: "/features/team-permissions",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-10 right-0 h-[300px] w-full origin-top scale-75 border-none [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: CreditCard,
    name: "Stripe billing",
    description: "Checkout, subscriptions, webhooks, and customer portal built in.",
    href: "/features/stripe-billing",
    className: "col-span-3 lg:col-span-1",
    background: (
      <SimpleBeamDemo className="absolute top-4 md:top-6 lg:top-10 right-0 h-[300px] w-full origin-top scale-75 border-none [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: ShieldCheck,
    name: "Supabase auth & RLS",
    description: "SSR cookie sessions and row-level security for tenant isolation.",
    href: "/features/supabase-auth",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center p-6 opacity-100">
        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/80 px-6 py-4 text-center shadow-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-600">RLS enabled</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">organization_id = tenant</p>
        </div>
      </div>
    ),
  },
  {
    Icon: Zap,
    name: "Deploy on Vercel",
    description: "Preview deployments, env vars, and production-ready Next.js hosting.",
    href: "/integrations/vercel",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center p-6 opacity-100">
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-6 py-4 text-center shadow-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Vercel</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">Preview &amp; production deploys</p>
        </div>
      </div>
    ),
  },
]

export default function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}
