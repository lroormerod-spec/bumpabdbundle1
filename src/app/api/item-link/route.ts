import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ── Tier 1: immersive product API (most reliable) ─────────────────────────
async function resolveViaImmersive(title: string, retailer?: string) {
  const query = retailer ? `${title} ${retailer.split(".")[0]}` : title;
  const searchUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=5`;
  const searchData = await fetch(searchUrl).then(r => r.json());
  const products = searchData.shopping_results || [];

  // Find best match — prefer retailer match if specified
  const product = retailer
    ? products.find((p: any) => p.source?.toLowerCase().includes(retailer.toLowerCase().split(".")[0])) || products[0]
    : products[0];

  if (!product?.immersive_product_page_token) return null;

  const immersiveUrl = `https://serpapi.com/search.json?engine=google_immersive_product&page_token=${encodeURIComponent(product.immersive_product_page_token)}&api_key=${SERPAPI_KEY}`;
  const immersiveData = await fetch(immersiveUrl).then(r => r.json());
  const stores: any[] = immersiveData.product_results?.stores || [];

  if (!stores.length) return null;

  // Prefer retailer match, then cheapest
  let chosen = stores[0];
  if (retailer) {
    const match = stores.find(s => s.name?.toLowerCase().includes(retailer.toLowerCase().split(".")[0]));
    if (match) chosen = match;
  }
  const cheapest = stores.reduce((a: any, b: any) => (a.extracted_price || 999) < (b.extracted_price || 999) ? a : b);
  if (!retailer) chosen = cheapest;

  return chosen?.link ? { url: chosen.link, retailerName: chosen.name } : null;
}

// ── Tier 2: google_product API by product_id ─────────────────────────────
async function resolveViaProductApi(title: string) {
  const searchUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(title)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=1`;
  const searchData = await fetch(searchUrl).then(r => r.json());
  const product = searchData.shopping_results?.[0];
  if (!product?.product_id) return null;

  const productUrl = `https://serpapi.com/search.json?engine=google_product&product_id=${product.product_id}&api_key=${SERPAPI_KEY}`;
  const productData = await fetch(productUrl).then(r => r.json());
  const sellers = productData.sellers_results?.online_sellers || [];
  if (!sellers.length) return null;

  const cheapest = sellers.reduce((a: any, b: any) => (a.base_price || 999) < (b.base_price || 999) ? a : b);
  return cheapest?.link ? { url: cheapest.link, retailerName: cheapest.name } : null;
}

// ── Tier 3: retailer-specific search ─────────────────────────────────────
async function resolveViaRetailerSearch(title: string, retailer: string) {
  const domain = retailer.toLowerCase().replace("amazon.co.uk - seller", "amazon.co.uk").trim();
  const query = `${title} site:${domain}`;
  const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=1`;
  const data = await fetch(searchUrl).then(r => r.json());
  const first = data.organic_results?.[0];
  return first?.link ? { url: first.link, retailerName: retailer } : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const retailer = searchParams.get("retailer") || undefined;
  const redirect = searchParams.get("redirect") === "1";

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);
  const cacheKey = `${title.toLowerCase().trim()}__${(retailer || "").toLowerCase().trim()}`;

  // ── Check link cache (24hr TTL) ──────────────────────────────────────────
  try {
    const [cached] = await sql`
      SELECT direct_url, retailer_name FROM link_cache 
      WHERE cache_key = ${cacheKey} 
      AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `;
    if (cached) {
      return NextResponse.json({ link: cached.direct_url, retailer: cached.retailer_name, cached: true });
    }
  } catch { /* continue */ }

  // ── Tier 1: immersive ───────────────────────────────────────────────────
  try {
    const result = await resolveViaImmersive(title, retailer);
    if (result) {
      sql`INSERT INTO link_cache (cache_key, direct_url, retailer_name) VALUES (${cacheKey}, ${result.url}, ${result.retailerName})
          ON CONFLICT (cache_key) DO UPDATE SET direct_url = EXCLUDED.direct_url, created_at = NOW()`.catch(() => {});
      if (redirect) return NextResponse.redirect(new URL(`/go?url=${encodeURIComponent(result.url)}&retailer=${encodeURIComponent(result.retailerName)}&title=${encodeURIComponent(title)}`, request.url));
      return NextResponse.json({ link: result.url, retailer: result.retailerName });
    }
  } catch (e) { console.error("Tier 1 failed:", e); }

  // ── Tier 2: product API ─────────────────────────────────────────────────
  try {
    const result = await resolveViaProductApi(title);
    if (result) {
      sql`INSERT INTO link_cache (cache_key, direct_url, retailer_name) VALUES (${cacheKey}, ${result.url}, ${result.retailerName})
          ON CONFLICT (cache_key) DO UPDATE SET direct_url = EXCLUDED.direct_url, created_at = NOW()`.catch(() => {});
      if (redirect) return NextResponse.redirect(new URL(`/go?url=${encodeURIComponent(result.url)}&retailer=${encodeURIComponent(result.retailerName)}&title=${encodeURIComponent(title)}`, request.url));
      return NextResponse.json({ link: result.url, retailer: result.retailerName });
    }
  } catch (e) { console.error("Tier 2 failed:", e); }

  // ── Tier 3: retailer-specific Google search ─────────────────────────────
  if (retailer) {
    try {
      const result = await resolveViaRetailerSearch(title, retailer);
      if (result) {
        sql`INSERT INTO link_cache (cache_key, direct_url, retailer_name) VALUES (${cacheKey}, ${result.url}, ${result.retailerName})
            ON CONFLICT (cache_key) DO UPDATE SET direct_url = EXCLUDED.direct_url, created_at = NOW()`.catch(() => {});
        if (redirect) return NextResponse.redirect(new URL(`/go?url=${encodeURIComponent(result.url)}&retailer=${encodeURIComponent(result.retailerName)}&title=${encodeURIComponent(title)}`, request.url));
        return NextResponse.json({ link: result.url, retailer: result.retailerName });
      }
    } catch (e) { console.error("Tier 3 failed:", e); }
  }

  // ── All tiers failed ─────────────────────────────────────────────────────
  sql`INSERT INTO link_failures (product_title, retailer, reason) VALUES (${title}, ${retailer || null}, 'all_tiers_failed')`.catch(() => {});
  if (redirect) {
    // Last resort — Google search for the product
    return NextResponse.redirect(new URL(`https://www.google.co.uk/search?q=${encodeURIComponent(title + " buy UK")}`, request.url));
  }
  return NextResponse.json({ link: null, retailer: null });
}
