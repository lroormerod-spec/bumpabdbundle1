import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateClicks } from "@/lib/schema";
import { applyAffiliateCode } from "@/lib/affiliates";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const retailer = searchParams.get("retailer") ?? "";
  const title = searchParams.get("title") ?? "";

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Apply affiliate tracking
  const finalUrl = applyAffiliateCode(url, retailer);

  // Log the click (best-effort — don't block the redirect)
  try {
    const session = await getSession();
    await db.insert(affiliateClicks).values({
      retailer: retailer || null,
      productTitle: title || null,
      originalUrl: url,
      finalUrl,
      userId: session?.userId ?? null,
    });
  } catch (err) {
    // Non-fatal — continue with redirect
    console.error("Failed to log affiliate click:", err);
  }

  return NextResponse.redirect(finalUrl, { status: 302 });
}
