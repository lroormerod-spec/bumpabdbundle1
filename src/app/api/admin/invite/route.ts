import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, magicLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim()
      .replace(/@googlemail\.com$/i, "@gmail.com");

    // Find or create user
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (!user) {
      const internalEmail = `invite_${randomBytes(8).toString("hex")}@bumpandbundle.app`;
      [user] = await db.insert(users).values({
        name: name || normalizedEmail.split("@")[0],
        email: internalEmail,
        realEmail: normalizedEmail,
        onboarded: false,
      }).returning();
    }

    // Generate magic link token — valid for 7 days
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(magicLinks).values({
      token,
      email: normalizedEmail,
      userId: user.id,
      expiresAt,
    });

    const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://bumpandbundle.com"}/api/auth/magic?token=${token}`;

    return NextResponse.json({ ok: true, magicUrl, expiresAt, user });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
