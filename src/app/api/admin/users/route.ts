import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, registries, items } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get all users
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    // Get registry counts per user
    const regCounts = await db
      .select({
        userId: registries.userId,
        count: sql<number>`COUNT(*)::int`,
        latestDueDate: sql<string | null>`MAX(due_date)`,
      })
      .from(registries)
      .groupBy(registries.userId);

    // Get item counts per user (via registry join)
    const itemCounts = await db
      .select({
        userId: registries.userId,
        itemCount: sql<number>`COUNT(${items.id})::int`,
        latestItemAt: sql<Date | null>`MAX(${items.createdAt})`,
      })
      .from(registries)
      .leftJoin(items, eq(items.registryId, registries.id))
      .groupBy(registries.userId);

    const regMap = new Map(regCounts.map((r) => [r.userId, r]));
    const itemMap = new Map(itemCounts.map((r) => [r.userId, r]));

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const enriched = allUsers.map((user) => {
      const reg = regMap.get(user.id);
      const itm = itemMap.get(user.id);
      const itemCount = itm?.itemCount ?? 0;
      const lastActive: Date | null = itm?.latestItemAt ?? null;
      const dueDate = reg?.latestDueDate ?? null;

      // Segment logic
      let segment: string;
      if (itemCount >= 10) {
        segment = "registry_complete";
      } else if (dueDate && new Date(dueDate) <= thirtyDaysFromNow && new Date(dueDate) >= now) {
        segment = "due_soon";
      } else if (lastActive && lastActive >= sevenDaysAgo && itemCount > 0) {
        segment = "active";
      } else if (reg && reg.count > 0 && itemCount === 0) {
        segment = "registered";
      } else if (user.createdAt && new Date(user.createdAt) <= sevenDaysAgo && itemCount === 0) {
        segment = "dormant";
      } else if (reg && reg.count > 0) {
        segment = "registered";
      } else {
        segment = "dormant";
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
        registryCount: reg?.count ?? 0,
        itemCount,
        dueDate,
        lastActive,
        segment,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("GET /api/admin/users:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Delete user's items via registries, then registries, then user
    const userRegistries = await db.select({ id: registries.id }).from(registries).where(eq(registries.userId, id));
    for (const reg of userRegistries) {
      await db.delete(items).where(eq(items.registryId, reg.id));
    }
    await db.delete(registries).where(eq(registries.userId, id));
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/users:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
