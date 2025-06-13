import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'http://localhost:3011'
      : 'http://localhost:3011'

    return [
      {
        source: '/api/login',
        destination: '/api/login' // Keep login route handled by Next.js
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*' // NextAuth остается локальным
      },
      {
        source: '/api/purchases/:path*',
        destination: `${backendUrl}/api/purchases/:path*`
      },
      {
        source: '/api/purchases',
        destination: `${backendUrl}/api/purchases`
      },
      {
        source: '/api/products/:path*',
        destination: `${backendUrl}/api/products/:path*`
      },
      {
        source: '/api/orders/:path*',
        destination: `${backendUrl}/api/orders/:path*`
      },
      {
        source: '/api/expenses/:path*',
        destination: `${backendUrl}/api/expenses/:path*`
      },
      {
        source: '/api/currency/:path*',
        destination: `${backendUrl}/api/currency/:path*`
      },
      {
        source: '/api/health',
        destination: `${backendUrl}/api/health`
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/ru/products',
        permanent: false,
        locale: false
      },
      {
        source: '/:lang(ru|tr)',
        destination: '/:lang/products',
        permanent: false,
        locale: false
      },
      {
        source: '/((?!(?:ru|tr|front-pages|favicon.ico)\\b)):path',
        destination: '/ru/:path',
        permanent: false,
        locale: false
      }
    ]
  }
}

export default nextConfig
