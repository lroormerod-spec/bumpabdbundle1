import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumpandbundle_jwt_secret_2026_super_secure"
);
const COOKIE_NAME = "bb_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin: Basic Auth first, session second
  if (pathname.startsWith("/admin")) {
    const basicAuth = request.headers.get("authorization");
    const validCredentials = Buffer.from(
      `admin:${process.env.ADMIN_PASSWORD || "Bmp&Bndl#2026!xK9"}`
    ).toString("base64");
    if (!basicAuth || basicAuth !== `Basic ${validCredentials}`) {
      return new NextResponse("Admin authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Bump & Bundle Admin"' },
      });
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
  matcher: ["/app/:path*", "/admin/:path*"],
};
