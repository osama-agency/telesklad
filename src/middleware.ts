import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/orders (Orders API routes - временно для тестирования)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|api/orders|_next/static|_next/image|favicon.ico|images|icon.svg).*)",
    "/pages/settings/:path*",
    "/api/user/update/:path*",
    "/api/user/get-user/:path*",
  ],
};
