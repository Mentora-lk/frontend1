import { NextRequest, NextResponse } from "next/server";
import { canAccessPath, isUserRole } from "./lib/routeRoles";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/unauthorized",
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isAdminAuthRoute = pathname === "/dashboard/admin/auth" || pathname.startsWith("/dashboard/admin/auth/");
  const isAdminSignupRoute = pathname === "/dashboard/admin/signup" || pathname.startsWith("/dashboard/admin/signup/");
  const isAdminForgotPasswordRoute = pathname === "/dashboard/admin/forgot-password" || pathname.startsWith("/dashboard/admin/forgot-password/");
  const isAdminResetPasswordRoute = pathname.startsWith("/dashboard/admin/reset-password/");

  if (isAdminAuthRoute || isAdminSignupRoute || isAdminForgotPasswordRoute || isAdminResetPasswordRoute) {
    return NextResponse.next();
  }

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