import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registries, items, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const [registry] = await db
      .select()
      .from(registries)
      .where(eq(registries.shareSlug, slug))
      .limit(1);

    if (!registry) return NextResponse.json({ error: "Registry not found" }, { status: 404 });

    const registryItems = await db
      .select()
      .from(items)
      .where(eq(items.registryId, registry.id));

    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, registry.userId))
      .limit(1);

    return NextResponse.json({
      registry,
      items: registryItems,
      ownerName: owner?.name || registry.parentNames,
    });
  } catch (err) {
    console.error("GET /api/share/[slug]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
