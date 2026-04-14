import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items } from "@/lib/schema";
import { isNotNull } from "drizzle-orm";

// Refreshes product prices for all registry items that have an immersive token
// Called by daily cron or manually from admin
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "https://bumpandbundle.com";

  // Get all items that have a product token stored
  const allItems = await db
    .select({ id: items.id, title: items.title, productToken: items.productToken })
    .from(items)
    .where(isNotNull(items.productToken));

  let refreshed = 0;
  let errors = 0;

  for (const item of allItems) {
    try {
      await fetch(`${origin}/api/product-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: item.productToken, title: item.title }),
      });
      refreshed++;
      await new Promise(r => setTimeout(r, 300));
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ refreshed, errors, total: allItems.length });
}
