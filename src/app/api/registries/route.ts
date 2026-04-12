import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const userRegistries = await db
      .select()
      .from(registries)
      .where(eq(registries.userId, session.userId));

    return NextResponse.json(userRegistries);
  } catch (err) {
    console.error("GET /api/registries:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { title, parentNames, dueDate, shareSlug, coverImage, message } = body;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const slug = shareSlug || Math.random().toString(36).slice(2, 10);

    const [registry] = await db
      .insert(registries)
      .values({
        userId: session.userId,
        title,
        parentNames: parentNames || "",
        dueDate: dueDate || null,
        shareSlug: slug,
        coverImage: coverImage || null,
        message: message || null,
      })
      .returning();

    return NextResponse.json(registry, { status: 201 });
  } catch (err) {
    console.error("POST /api/registries:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
