import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {
    // Workspaces can hoist `next` to the repo root instead of apps/web.
    root: path.resolve(import.meta.dirname, '../..'),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    localPatterns: [{ pathname: '/**' }],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
