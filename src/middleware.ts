// This file configures the middleware for your application.
// It tells Next.js which pages should be protected.
export { default } from "next-auth/middleware";

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - auth/signin (the sign-in page itself)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)"],
};
