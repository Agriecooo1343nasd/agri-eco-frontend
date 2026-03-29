import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROLES = new Set(["admin", "staff", "manager", "member"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Legacy invite links pointed at /admin/accept-invite — public route is /accept-invite */
  if (pathname === "/admin/accept-invite") {
    const url = request.nextUrl.clone();
    url.pathname = "/accept-invite";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
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
