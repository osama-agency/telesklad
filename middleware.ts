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

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - login (login page)
//      * - public assets
//      * - root page (/)
//      * - products page
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|login|images|icons|ru/products|tr/products|^$).*)',
//   ]
// }
