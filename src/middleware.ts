import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumpandbundle_jwt_secret_2026_super_secure"
);
const COOKIE_NAME = "bb_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const url = new URL("/#sign-in", request.url);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Admin routes require isAdmin
      if (pathname.startsWith("/admin") && !payload.isAdmin) {
        return NextResponse.redirect(new URL("/app", request.url));
      }

      return NextResponse.next();
    } catch {
      // Session expired — send back to sign-in
      const url = new URL("/#sign-in", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
