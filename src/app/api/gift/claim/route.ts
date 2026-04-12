import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, giftClaims, registries } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { itemId, gifterName, registryId } = await req.json();

    if (!itemId || !gifterName?.trim() || !registryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify item belongs to this registry and is not already purchased
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.registryId, registryId)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.isPurchased) {
      return NextResponse.json({ error: "This item has already been purchased" }, { status: 409 });
    }

    // Check if already reserved by someone else
    const [existingClaim] = await db
      .select()
      .from(giftClaims)
      .where(
        and(
          eq(giftClaims.itemId, itemId),
          eq(giftClaims.status, "reserved")
        )
      )
      .limit(1);

    if (existingClaim) {
      return NextResponse.json(
        { error: "Someone else has already reserved this item" },
        { status: 409 }
      );
    }

    // Generate a secure token for the gifter to use later
    const token = randomBytes(24).toString("hex");

    const [claim] = await db
      .insert(giftClaims)
      .values({
        itemId,
        registryId,
        gifterName: gifterName.trim(),
        token,
        status: "reserved",
      })
      .returning();

    return NextResponse.json({ token, claimId: claim.id });
  } catch (err) {
    console.error("Gift claim error:", err);
    return NextResponse.json({ error: "Failed to reserve item" }, { status: 500 });
  }
}
