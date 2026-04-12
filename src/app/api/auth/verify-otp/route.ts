import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpCodes, users } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate OTP
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, normalizedEmail),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gt(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Mark OTP as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));

    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const isNewUser = !user;

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: "",
          isAdmin: false,
          onboarded: false,
        })
        .returning();
      user = newUser;
    }

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        onboarded: user.onboarded,
      },
      isNewUser,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
