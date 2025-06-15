// import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}


// export default withAuth(
//   function middleware(req) {
//     // Если пользователь авторизован и пытается зайти на /login, перенаправляем на главную
//     if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
    
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         // Разрешаем доступ к /login без авторизации
//         if (req.nextUrl.pathname === "/login") {
//           return true;
//         }
        
//         // Для всех остальных маршрутов требуем авторизацию
//         return !!token;
//       },
//     },
//   }
// );

export const config = {
  matcher: [
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
