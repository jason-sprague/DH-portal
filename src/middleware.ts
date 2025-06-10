import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Only protect /dashboard and its subroutes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};