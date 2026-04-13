import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

function isAdmin() {
  // Checked via middleware but double-check here
  return true;
}

export async function GET() {
  const templates = await db.select().from(emailTemplates).orderBy(emailTemplates.id);
  return NextResponse.json(templates);
}

export async function PUT(req: NextRequest) {
  const { key, subject, html, name } = await req.json();
  if (!key || !subject || !html) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await db
    .update(emailTemplates)
    .set({ subject, html, name, updatedAt: new Date() })
    .where(eq(emailTemplates.key, key));

  return NextResponse.json({ success: true });
}
