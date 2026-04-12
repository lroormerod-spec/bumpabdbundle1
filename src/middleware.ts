import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumpandbundle_jwt_secret_2026_super_secure"
);
const COOKIE_NAME = "bb_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin: check for admin cookie
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get("bb_admin")?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || "Bmp&Bndl#2026!xK9";
    if (adminCookie !== adminPassword) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    return NextResponse.next();
  }

  // App routes: require valid session
  if (pathname.startsWith("/app")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/#sign-in", request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/#sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/admin"],
};
