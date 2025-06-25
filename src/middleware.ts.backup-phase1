// ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
// import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // Логирование только для не-webapp маршрутов
    if (!pathname.startsWith('/webapp') && !pathname.startsWith('/api/webapp')) {
      console.log(`[Middleware] Path: ${pathname}, User: ${token?.email}, Role: ${token?.role}`);
    }
    
    // Проверка доступа к админским маршрутам
    const isAdminRoute = pathname.startsWith('/admin') || 
                        pathname.startsWith('/pages/settings') ||
                        pathname.startsWith('/api/user/check-admin') ||
                        pathname.startsWith('/api/user/upload-avatar');
    
    if (isAdminRoute) {
      // Проверяем роль администратора
      if (token?.role !== 'ADMIN') {
        console.log(`[Middleware] Access denied for ${token?.email} to ${pathname}`);
        return NextResponse.redirect(new URL('/403', req.url));
      }
      
      // Дополнительная проверка для критических операций
      const criticalRoutes = ['/api/user/delete', '/api/user/change-password'];
      if (criticalRoutes.some(route => pathname.startsWith(route))) {
        // Проверяем конкретный email для супер-критических операций
        const allowedAdmins = process.env.ADMIN_EMAILS?.split(',') || ['go@osama.agency'];
        if (!allowedAdmins.includes(token.email?.toLowerCase() || '')) {
          console.log(`[Middleware] Critical operation denied for ${token?.email}`);
          return NextResponse.redirect(new URL('/403', req.url));
        }
      }
    }
    
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
        const url = req.nextUrl.clone();
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
        const url = req.nextUrl.clone();
        url.pathname = newApiPath;
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Разрешаем доступ к публичным маршрутам без токена
        if (pathname.startsWith('/api/webhook') || 
            pathname.startsWith('/api/telegram') ||
            pathname.startsWith('/api/webapp') ||
            pathname.startsWith('/api/redis') ||
            pathname.startsWith('/api/test-telegram-notifications') ||
            pathname.startsWith('/api/test-shipped')) {
          return true;
        }
        
        // Для всех остальных защищенных маршрутов требуем токен
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
      error: '/error',
    }
  }
);

export const config = {
  matcher: [
    // Защищаем все маршруты кроме публичных
    "/((?!_next/static|_next/image|favicon.ico|login|signup|reset|verify|webapp).*)",
  ],
};
