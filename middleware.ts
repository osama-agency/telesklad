// Next Imports
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Third-party Imports
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(request: NextRequest) {
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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Публичные страницы, которые не требуют авторизации
        const publicPaths = [
          '/login',
          '/register',
          '/forgot-password',
          '/pages/auth',
          '/api/auth',
          '/api/login',
          '/_next',
          '/favicon.ico'
        ]

        const pathname = req.nextUrl.pathname

        // Проверяем, является ли путь публичным
        const isPublicPath = publicPaths.some(path =>
          pathname.includes(path) || pathname.startsWith(path)
        )

        // Если это публичный путь, разрешаем доступ
        if (isPublicPath) {
          return true
        }

        // Для всех остальных путей требуем токен
        return !!token
      }
    },
    pages: {
      signIn: '/ru/login'
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
