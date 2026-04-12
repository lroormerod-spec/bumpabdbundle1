import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumpandbundle_jwt_secret_2026_super_secure"
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

    // Verify it's a valid JWT we issued
    await jwtVerify(token, JWT_SECRET);

    const response = NextResponse.json({ ok: true });
    response.cookies.set("bb_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
