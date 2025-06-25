import type { NextAuthConfig } from 'next-auth';

// This is the configuration that the middleware will use.
// It is EDGE-COMPATIBLE.
export const authConfig = {
  providers: [], // Providers are defined in the main auth.ts
  pages: {
    signIn: '/', // If a user needs to log in, redirect them to the homepage
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

      // Protect admin route
      if (isAdminRoute) {
        if (isLoggedIn && userRole === 'ADMIN') return true;
        return false;
      }
      
      // Protect dashboard route
      if (isDashboardRoute) {
        if (isLoggedIn) return true;
        return false; 
      }

      // If already logged in, redirect away from home page
      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
    
    // This JWT callback adds the basic user info to the token
    // It does NOT access the database.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    // The session callback here provides the basic user info from the token.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;