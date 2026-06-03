import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: '--font-barlow-semi-condensed',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'My Company — Multitenant SaaS Starter',
    template: '%s | My Company',
  },
  description: 'Production-ready multitenant SaaS starter with Supabase, Stripe, and Vercel.',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${barlowSemiCondensed.variable} ${inter.variable} antialiased font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
