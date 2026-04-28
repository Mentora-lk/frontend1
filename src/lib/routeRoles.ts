export type UserRole = "admin" | "student" | "tutor";

export const DASHBOARD_PREFIX_BY_ROLE: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
};

export function canAccessPath(pathname: string, role: UserRole): boolean {
  if (!pathname.startsWith("/dashboard")) {
    return true;
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return role === "admin";
  }

  if (pathname.startsWith("/dashboard/student")) {
    return role === "student";
  }

  if (pathname.startsWith("/dashboard/tutor")) {
    return role === "tutor";
  }

  return false;
}

export function isUserRole(value: string | undefined): value is UserRole {
  return value === "admin" || value === "student" || value === "tutor";
}
