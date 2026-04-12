import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json();

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Normalise googlemail.com ↔ gmail.com (same inbox, prevents duplicate accounts)
    // Always store/look up as gmail.com
    const email = rawEmail.toLowerCase().trim()
      .replace(/@googlemail\.com$/i, "@gmail.com")
      .replace(/@gmail\.com$/i, "@gmail.com");

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await db.insert(otpCodes).values({
      email: email.toLowerCase().trim(),
      code,
      expiresAt,
    });

    // Send email via Resend
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#fdf9f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:hsl(152,28%,38%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">🤰</span>
                <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Bump & Bundle</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#1e2433;font-size:24px;font-weight:700;">Your sign-in code</h2>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Use this code to sign in to your Bump & Bundle account. It expires in 10 minutes.
              </p>
              <!-- Code box -->
              <div style="background:hsl(152,28%,95%);border:2px solid hsl(152,28%,38%);border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                <div style="color:hsl(152,28%,38%);font-size:42px;font-weight:800;letter-spacing:8px;line-height:1;">${code}</div>
              </div>
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e8ddd4;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Bump & Bundle · <a href="https://bumpandbundle.com" style="color:hsl(152,28%,38%);">bumpandbundle.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Bump & Bundle <hello@bumpandbundle.com>",
      to: email,
      subject: `${code} is your Bump & Bundle sign-in code`,
      html,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      // Domain not yet fully verified — fall back to onboarding@resend.dev
      const { error: fallbackError } = await resend.emails.send({
        from: "Bump & Bundle <onboarding@resend.dev>",
        to: email,
        subject: `${code} is your Bump & Bundle sign-in code`,
        html,
      });
      if (fallbackError) {
        console.error("Fallback Resend error:", JSON.stringify(fallbackError));
        return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
