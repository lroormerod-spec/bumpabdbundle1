import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateClicks } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Aggregate by retailer + date
    const clicks = await db
      .select()
      .from(affiliateClicks)
      .orderBy(desc(affiliateClicks.createdAt))
      .limit(200);

    // Group by retailer for summary
    const byRetailer = await db
      .select({
        retailer: affiliateClicks.retailer,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(affiliateClicks)
      .groupBy(affiliateClicks.retailer)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({ clicks, byRetailer });
  } catch (err) {
    console.error("GET /api/admin/affiliate-clicks:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
