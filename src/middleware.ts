// Middleware — naam-gebaseerd auth systeem
// TODO: replace with full auth — NextAuth.js JWT token check

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/onboarding", "/api/auth/onboard", "/api/init-db", "/start"];
const TOKEN_NAME = "hpb-user-token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for user token cookie
  const token = req.cookies.get(TOKEN_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
