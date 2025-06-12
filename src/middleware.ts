// /middleware.ts or /src/middleware.ts

import { NextResponse } from 'next/server';
import { auth } from './auth'; // Adjust path if needed

export default auth((req) => {
  const { auth } = req;
  const isLoggedIn = !!auth;
  const userHasCompany = !!auth?.user.company;
  const { pathname } = req.nextUrl;

  // Check if the user is trying to access a protected route
  const isAccessingProtectedRoute = pathname.startsWith('/dashboard');

  if (isAccessingProtectedRoute) {
    // If they are not logged in, redirect them to the home page
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }

        if (!userHasCompany) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // If a logged-in user tries to visit the home page,
  // redirect them to the dashboard for a better UX.
  if (isLoggedIn && userHasCompany && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow the request to continue for all other cases
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};