import { NextResponse } from 'next/server';
import { auth } from './auth'; 

export default auth((req) => {
  const { auth } = req;
  const isLoggedIn = !!auth;
  const userRole = auth?.user?.role
  const userHasCompany = !!auth?.user.companies?.length;
  const { pathname } = req.nextUrl;

    const isAccessingAdminRoute = pathname.startsWith('/admin');
  if (isAccessingAdminRoute) {
    if (userRole !== 'ADMIN') {
      // Redirect non-admins away from admin routes
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Allow admins to proceed
    return NextResponse.next();
  }

  // Check if the user is trying to access a protected route
  const isAccessingProtectedRoute = pathname.startsWith('/dashboard');

  if (isAccessingProtectedRoute) {
    // If they are not logged in, redirect them to the home page
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (!userHasCompany) {
      return NextResponse.redirect(new URL('/wait', req.url));
    }
  }

  // If a logged-in user tries to visit the home page,
  // redirect them to the dashboard for a better UX.
  if (isLoggedIn && userHasCompany && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isLoggedIn && !userHasCompany && pathname === '/') {
     return NextResponse.redirect(new URL('/wait', req.url));
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