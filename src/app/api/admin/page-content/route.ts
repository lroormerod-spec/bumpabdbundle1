import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageContent } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rows = await db.select().from(pageContent).orderBy(pageContent.key);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/page-content:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { key, value } = body as { key: string; value: string };

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const [updated] = await db
      .update(pageContent)
      .set({ value, updatedAt: new Date() })
      .where(eq(pageContent.key, key))
      .returning();

    // Revalidate homepage so changes take effect immediately
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/page-content:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
