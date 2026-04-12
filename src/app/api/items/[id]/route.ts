import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, registries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function verifyItemOwnership(itemId: number, userId: number) {
  const [item] = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
  if (!item) return null;
  const [registry] = await db
    .select()
    .from(registries)
    .where(eq(registries.id, item.registryId))
    .limit(1);
  if (!registry || registry.userId !== userId) return null;
  return item;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const item = await verifyItemOwnership(parseInt(id), session.userId);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();

    const [updated] = await db
      .update(items)
      .set({
        ...(body.title !== undefined && { title: body.title }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.isPurchased !== undefined && { isPurchased: body.isPurchased }),
        ...(body.purchasedBy !== undefined && { purchasedBy: body.purchasedBy }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.priceAlert !== undefined && { priceAlert: body.priceAlert }),
        ...(body.category !== undefined && { category: body.category }),
      })
      .where(eq(items.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/items/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const item = await verifyItemOwnership(parseInt(id), session.userId);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(items).where(eq(items.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/items/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
