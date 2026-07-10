import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

const AUTH_RATE_LIMIT = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
};

function forwardWithPathname(req: Request, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") && req.method === "POST") {
    const ip = getClientIp(req);
    const { allowed, retryAfterSeconds } = checkRateLimit(
      `auth:${ip}`,
      AUTH_RATE_LIMIT,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      );
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !req.auth) {
    return new NextResponse(null, { status: 404 });
  }

  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (isAdminRoute) {
    return forwardWithPathname(req, pathname);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};