import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/schema";
import { sendTemplateEmail } from "@/lib/email";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json();

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = rawEmail.toLowerCase().trim()
      .replace(/@googlemail\.com$/i, "@gmail.com")
      .replace(/@gmail\.com$/i, "@gmail.com");

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpCodes).values({ email, code, expiresAt });

    await sendTemplateEmail({
      to: email,
      templateKey: "otp",
      vars: { code },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}
