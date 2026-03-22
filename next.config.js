/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    disableExplorativeBuilds: true,
  },
  jest: {
    disableFragileAPIRoutes: true,
  },
}

module.exports = nextConfig
