import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROLES = new Set(["admin", "staff", "manager", "member"]);

// Public pages under /admin that do not require authentication
const ADMIN_PUBLIC_PATHS = new Set(["/admin/accept-invite"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin pages through without auth checks
  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const isAuthenticated =
    request.cookies.get("agri_eco_authenticated")?.value === "1";
  const role = request.cookies.get("agri_eco_role")?.value;

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!role || !ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
