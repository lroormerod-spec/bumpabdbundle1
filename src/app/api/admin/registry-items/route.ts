import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const registryId = parseInt(req.nextUrl.searchParams.get("registryId") || "0");
  if (!registryId) return NextResponse.json({ error: "Missing registryId" }, { status: 400 });

  const registryItems = await db
    .select({
      id: items.id,
      title: items.title,
      price: items.price,
      image: items.image,
      retailer: items.retailer,
      category: items.category,
      isPurchased: items.isPurchased,
      purchasedBy: items.purchasedBy,
    })
    .from(items)
    .where(eq(items.registryId, registryId))
    .orderBy(items.id);

  return NextResponse.json(registryItems);
}
