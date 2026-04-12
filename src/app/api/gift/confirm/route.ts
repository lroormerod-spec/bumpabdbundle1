import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, giftClaims } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Look up the claim
    const [claim] = await db
      .select()
      .from(giftClaims)
      .where(eq(giftClaims.token, token))
      .limit(1);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status === "purchased") {
      return NextResponse.json({ success: true, alreadyConfirmed: true });
    }

    if (claim.status === "cancelled") {
      return NextResponse.json({ error: "This reservation was cancelled" }, { status: 409 });
    }

    // Mark claim as purchased
    await db
      .update(giftClaims)
      .set({ status: "purchased", purchasedAt: new Date() })
      .where(eq(giftClaims.token, token));

    // Mark the item as purchased in the registry
    await db
      .update(items)
      .set({ isPurchased: true, purchasedBy: claim.gifterName })
      .where(eq(items.id, claim.itemId));

    return NextResponse.json({ success: true, gifterName: claim.gifterName });
  } catch (err) {
    console.error("Gift confirm error:", err);
    return NextResponse.json({ error: "Failed to confirm purchase" }, { status: 500 });
  }
}
