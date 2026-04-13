import { NextRequest, NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { to, templateKey } = await req.json();

  if (!to || !templateKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await sendTemplateEmail({
      to,
      templateKey,
      vars: {
        code: "123456",
        name: "Test User",
        magic_link: "https://bumpandbundle.com",
      },
    });
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
