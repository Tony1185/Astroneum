import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // astroneum is an ESM-only package — tell Next.js to transpile it so
  // the server-side import path resolves correctly even though the page
  // itself is a client component.
  transpilePackages: ['astroneum'],
  // Silence the workspace-root lockfile warning
  outputFileTracingRoot: path.join(__dirname, '../'),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
}

export default nextConfig
