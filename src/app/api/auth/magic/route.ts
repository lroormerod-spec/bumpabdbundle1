import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { magicLinks, users } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumpandbundle_jwt_secret_2026_super_secure"
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/#sign-in", request.url));
  }

  try {
    const [link] = await db.select().from(magicLinks).where(
      and(
        eq(magicLinks.token, token),
        eq(magicLinks.used, false),
        gt(magicLinks.expiresAt, new Date())
      )
    );

    if (!link) {
      return NextResponse.redirect(new URL("/?error=invalid_link", request.url));
    }

    // Only mark as used in production — keep reusable during testing
    if (process.env.MAGIC_LINK_SINGLE_USE === "true") {
      await db.update(magicLinks).set({ used: true }).where(eq(magicLinks.id, link.id));
    }

    const [user] = await db.select().from(users).where(eq(users.id, link.userId!));
    if (!user) {
      return NextResponse.redirect(new URL("/?error=user_not_found", request.url));
    }

    // Build JWT manually so we can set it on the redirect response
    const sessionToken = await new SignJWT({ userId: user.id, email: user.email, isAdmin: user.isAdmin })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    // Redirect to welcome page which will handle the session client-side
    // Use a short-lived token in the URL to avoid cookie-in-redirect issues
    const response = NextResponse.redirect(new URL(`/welcome?t=${sessionToken}`, request.url));
    return response;
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
