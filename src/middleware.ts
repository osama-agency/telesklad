// ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
// import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { withAuth } from "next-auth/middleware";

function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Редиректы для старых analytics маршрутов
  if (pathname.startsWith('/analytics/')) {
    const redirectMap: Record<string, string> = {
      '/analytics/ai': '/products',
      '/analytics/purchases': '/purchases',
      '/analytics/orders': '/orders-analytics', 
      '/analytics/expenses': '/expenses-analytics',
    };

    const newPath = redirectMap[pathname];
    if (newPath) {
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return NextResponse.redirect(url);
    }
  }

  // Редиректы для API маршрутов
  if (pathname.startsWith('/api/analytics/')) {
    const apiRedirectMap: Record<string, string> = {
      '/api/analytics/ai': '/api/ai',
      '/api/analytics/abcxyz': '/api/abcxyz',
    };

    const newApiPath = apiRedirectMap[pathname];
    if (newApiPath) {
      const url = request.nextUrl.clone();
      url.pathname = newApiPath;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default middleware;

// ЗАКОММЕНТИРОВАННЫЙ КОД АВТОРИЗАЦИИ (для восстановления позже):
/*
export default withAuth(
  function middleware(req) {
    // Если пользователь авторизован и пытается зайти на /login, перенаправляем на главную
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Разрешаем доступ к /login без авторизации
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        
        // Для всех остальных маршрутов требуем авторизацию
        return !!token;
      },
    },
  }
);
*/

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    "/api/((?!auth).*)", // Include API routes except auth
  ],
};
