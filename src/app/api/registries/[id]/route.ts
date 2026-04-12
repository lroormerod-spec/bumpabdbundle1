import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registries } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const [registry] = await db
      .select()
      .from(registries)
      .where(and(eq(registries.id, parseInt(id)), eq(registries.userId, session.userId)))
      .limit(1);

    if (!registry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(registry);
  } catch (err) {
    console.error("GET /api/registries/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, parentNames, dueDate, coverImage, message } = body;

    const [updated] = await db
      .update(registries)
      .set({
        ...(title && { title }),
        ...(parentNames !== undefined && { parentNames }),
        ...(dueDate !== undefined && { dueDate }),
        ...(coverImage !== undefined && { coverImage }),
        ...(message !== undefined && { message }),
      })
      .where(and(eq(registries.id, parseInt(id)), eq(registries.userId, session.userId)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/registries/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    await db
      .delete(registries)
      .where(and(eq(registries.id, parseInt(id)), eq(registries.userId, session.userId)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/registries/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
