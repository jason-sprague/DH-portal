import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// The .auth property uses the 'authorized' callback from auth.config.ts
// to protect pages automatically.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};