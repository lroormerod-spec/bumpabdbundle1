import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, registries, items } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allUsers = await db.select().from(users);

    const regCounts = await db
      .select({
        userId: registries.userId,
        count: sql<number>`COUNT(*)::int`,
        latestDueDate: sql<string | null>`MAX(due_date)`,
      })
      .from(registries)
      .groupBy(registries.userId);

    const itemCounts = await db
      .select({
        userId: registries.userId,
        itemCount: sql<number>`COUNT(${items.id})::int`,
      })
      .from(registries)
      .leftJoin(items, eq(items.registryId, registries.id))
      .groupBy(registries.userId);

    const regMap = new Map(regCounts.map((r) => [r.userId, r]));
    const itemMap = new Map(itemCounts.map((r) => [r.userId, r]));

    const headers = ["id", "name", "email", "is_admin", "onboarded", "created_at", "registry_count", "item_count", "due_date"];

    const rows = allUsers.map((u) => {
      const reg = regMap.get(u.id);
      const itm = itemMap.get(u.id);
      return [
        u.id,
        `"${(u.name ?? "").replace(/"/g, '""')}"`,
        `"${u.email.replace(/"/g, '""')}"`,
        u.isAdmin ? "true" : "false",
        u.onboarded ? "true" : "false",
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
        reg?.count ?? 0,
        itm?.itemCount ?? 0,
        reg?.latestDueDate ?? "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bumpandbundle-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/export:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
