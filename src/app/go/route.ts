import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateClicks, affiliateConfig } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Generic AWIN deep link wrapper — works for any AWIN retailer even without programme ID
function buildGenericAwinUrl(originalUrl: string, publisherId: string): string {
  return `https://www.awin1.com/cread.php?awinpublid=${publisherId}&ued=${encodeURIComponent(originalUrl)}`;
}

function buildAffiliateUrl(originalUrl: string, config: typeof affiliateConfig.$inferSelect): string {
  const { network, publisherId, programmeId, customUrlTemplate, trackingParam } = config;

  // Custom template overrides everything
  if (customUrlTemplate) {
    return customUrlTemplate
      .replace("{url}", encodeURIComponent(originalUrl))
      .replace("{publisher_id}", publisherId || "")
      .replace("{programme_id}", programmeId || "");
  }

  switch (network) {
    case "awin": {
      // AWIN standard URL format
      if (!publisherId || !programmeId) return originalUrl;
      return `https://www.awin1.com/cread.php?awinmid=${programmeId}&awinpublid=${publisherId}&clickref=&ued=${encodeURIComponent(originalUrl)}`;
    }
    case "amazon_associates": {
      // Amazon Associates — append tag parameter
      if (!publisherId) return originalUrl;
      const sep = originalUrl.includes("?") ? "&" : "?";
      return `${originalUrl}${sep}tag=${publisherId}`;
    }
    case "rakuten": {
      // Rakuten LinkShare format
      if (!publisherId || !programmeId) return originalUrl;
      return `https://click.linksynergy.com/deeplink?id=${publisherId}&mid=${programmeId}&murl=${encodeURIComponent(originalUrl)}`;
    }
    case "cj": {
      // Commission Junction format
      if (!publisherId || !programmeId) return originalUrl;
      return `https://www.anrdoezrs.net/click-${publisherId}-${programmeId}?url=${encodeURIComponent(originalUrl)}`;
    }
    case "tradedoubler": {
      if (!publisherId || !programmeId) return originalUrl;
      return `https://clkuk.tradedoubler.com/click?p=${programmeId}&a=${publisherId}&url=${encodeURIComponent(originalUrl)}`;
    }
    case "manual": {
      // Just append a custom tracking param
      if (!trackingParam) return originalUrl;
      const sep = originalUrl.includes("?") ? "&" : "?";
      return `${originalUrl}${sep}${trackingParam}`;
    }
    default:
      return originalUrl;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const retailerParam = searchParams.get("retailer") ?? "";
  const title = searchParams.get("title") ?? "";

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Reject Google Shopping URLs — must be a real retailer endpoint
  if (url.includes("google.com") || url.includes("google.co.uk")) {
    console.error("Blocked Google URL in /go:", url);
    // Log failure and return error
    return NextResponse.json({ error: "Not a retailer URL" }, { status: 400 });
  }

  let finalUrl = url;
  let configUsed: typeof affiliateConfig.$inferSelect | null = null;

  try {
    // Look up retailer config from DB
    const configs = await db.select().from(affiliateConfig);
    const AWIN_PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID || "";

    // Find matching active config by domain
    const matched = configs.find(c => {
      const domain = c.retailerDomain.toLowerCase();
      const retailerLower = retailerParam.toLowerCase();
      const urlLower = url.toLowerCase();
      return retailerLower.includes(domain) || domain.includes(retailerLower.split(".")[0]) || urlLower.includes(domain);
    });

    if (matched && matched.active) {
      // Use specific configured tracking
      configUsed = matched;
      finalUrl = buildAffiliateUrl(url, matched);
    } else if (AWIN_PUBLISHER_ID) {
      // Fall back to generic AWIN deep link for any retailer
      finalUrl = buildGenericAwinUrl(url, AWIN_PUBLISHER_ID);
    }
    // If no publisher ID set yet, pass through direct URL (still goes to retailer)
  } catch (err) {
    console.error("Affiliate config lookup failed:", err);
  }

  // Log the click (non-blocking)
  try {
    const session = await getSession();
    await db.insert(affiliateClicks).values({
      retailer: configUsed?.retailerName || retailerParam || null,
      productTitle: title || null,
      originalUrl: url,
      finalUrl,
      userId: session?.userId ?? null,
    });
  } catch (err) {
    console.error("Failed to log affiliate click:", err);
  }

  return NextResponse.redirect(finalUrl, { status: 302 });
}
