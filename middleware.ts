// Temporarily disabled for testing
// import { withAuth } from "next-auth/middleware"

// export default withAuth(
//   function middleware() {
//     // Additional middleware logic can be added here if needed
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token
//     },
//     pages: {
//       signIn: '/login'
//     }
//   }
// )

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the pathname is just '/'
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/ru/dashboard', request.url))
  }

  // Check if pathname doesn't have a locale
  const pathnameHasLocale = /^\/(ru|en|tr)/.test(pathname)

  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    // Redirect to /ru version
    return NextResponse.redirect(new URL(`/ru${pathname}`, request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ]
}
