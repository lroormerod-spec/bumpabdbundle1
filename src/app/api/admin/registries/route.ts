import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registries, items } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Delete items first, then the registry
    await db.delete(items).where(eq(items.registryId, id));
    await db.delete(registries).where(eq(registries.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/registries:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
