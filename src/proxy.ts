import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";
import { buildContentSecurityPolicy } from "@/lib/security-headers";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce);
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !req.auth) {
    const response = new NextResponse(null, { status: 404 });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (isAdminRoute) {
    requestHeaders.set("x-pathname", pathname);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
