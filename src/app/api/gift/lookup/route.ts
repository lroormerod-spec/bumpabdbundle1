import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { giftClaims, items } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [claim] = await db
    .select()
    .from(giftClaims)
    .where(eq(giftClaims.token, token))
    .limit(1);

  if (!claim) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [item] = await db
    .select()
    .from(items)
    .where(eq(items.id, claim.itemId))
    .limit(1);

  return NextResponse.json({
    claim: {
      id: claim.id,
      gifterName: claim.gifterName,
      status: claim.status,
      reservedAt: claim.reservedAt,
      purchasedAt: claim.purchasedAt,
    },
    item: item
      ? {
          id: item.id,
          title: item.title,
          image: item.image,
          price: item.price,
          url: item.url,
          retailer: item.retailer,
        }
      : null,
  });
}
