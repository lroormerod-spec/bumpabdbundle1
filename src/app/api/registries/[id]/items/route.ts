import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, registries } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;

    // Verify registry belongs to user
    const [registry] = await db
      .select()
      .from(registries)
      .where(and(eq(registries.id, parseInt(id)), eq(registries.userId, session.userId)))
      .limit(1);

    if (!registry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const registryItems = await db
      .select()
      .from(items)
      .where(eq(items.registryId, parseInt(id)));

    return NextResponse.json(registryItems);
  } catch (err) {
    console.error("GET /api/registries/[id]/items:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Verify registry belongs to user
    const [registry] = await db
      .select()
      .from(registries)
      .where(and(eq(registries.id, parseInt(id)), eq(registries.userId, session.userId)))
      .limit(1);

    if (!registry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [item] = await db
      .insert(items)
      .values({
        registryId: parseInt(id),
        title: body.title,
        price: body.price || null,
        image: body.image || null,
        retailer: body.retailer || null,
        url: body.url || null,
        category: body.category || "Other",
        notes: body.notes || null,
        productToken: body.productToken || null,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/registries/[id]/items:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
