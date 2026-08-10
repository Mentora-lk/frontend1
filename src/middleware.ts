import { NextRequest, NextResponse } from "next/server";
import { canAccessPath, isUserRole } from "./lib/routeRoles";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/signup",
  "/auth/forgot-password",
  "/unauthorized",
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const roleCookie = request.cookies.get("user_role")?.value;

  if (!isUserRole(roleCookie)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessPath(pathname, roleCookie)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
