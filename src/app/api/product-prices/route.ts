import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const CACHE_TTL_HOURS = 24;

// In-memory cache to avoid redundant DB lookups
const memCache = new Map<string, { data: any; ts: number }>();
const MEM_TTL_MS = 10 * 60 * 1000;

export interface PriceEntry {
  retailer: string;
  price: number;
  url: string | null;
}

async function fetchProductPrices(token: string): Promise<PriceEntry[]> {
  const url = `https://serpapi.com/search.json?engine=google_product&product_id=${encodeURIComponent(token)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`SerpAPI product error: ${res.status}`);
  const data = await res.json();

  // sellers_results contains all retailers with prices
  const sellers = data.sellers_results?.online_sellers || [];
  return sellers
    .filter((s: any) => s.price && s.name)
    .map((s: any) => ({
      retailer: s.name,
      price: parseFloat(String(s.price).replace(/[^0-9.]/g, "")) || 0,
      url: s.link || null,
    }))
    .filter((s: PriceEntry) => s.price > 0)
    .sort((a: PriceEntry, b: PriceEntry) => a.price - b.price);
}

// GET — return cached prices for a token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Memory cache
  const mem = memCache.get(token);
  if (mem && Date.now() - mem.ts < MEM_TTL_MS) {
    return NextResponse.json(mem.data);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const [row] = await sql`
    SELECT lowest_price, lowest_retailer, all_prices, retailer_count, updated_at
    FROM product_prices WHERE token = ${token} LIMIT 1
  `;

  if (row) {
    const ageHours = (Date.now() - new Date(row.updated_at).getTime()) / 3600000;
    const result = {
      lowestPrice: Number(row.lowest_price),
      lowestRetailer: row.lowest_retailer,
      allPrices: row.all_prices,
      retailerCount: row.retailer_count,
      stale: ageHours >= CACHE_TTL_HOURS,
    };
    memCache.set(token, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  }

  return NextResponse.json({ notFound: true });
}

// POST — fetch from SerpAPI and store
export async function POST(req: NextRequest) {
  const { token, title } = await req.json();
  if (!token || !title) return NextResponse.json({ error: "Missing token or title" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  // Check if already fresh
  const [existing] = await sql`
    SELECT updated_at FROM product_prices WHERE token = ${token} LIMIT 1
  `;
  if (existing) {
    const ageHours = (Date.now() - new Date(existing.updated_at).getTime()) / 3600000;
    if (ageHours < CACHE_TTL_HOURS) {
      return NextResponse.json({ status: "fresh" });
    }
  }

  try {
    const prices = await fetchProductPrices(token);
    if (prices.length === 0) {
      return NextResponse.json({ status: "no_results" });
    }

    const lowest = prices[0];
    await sql`
      INSERT INTO product_prices (token, title, lowest_price, lowest_retailer, all_prices, retailer_count, updated_at)
      VALUES (${token}, ${title}, ${lowest.price}, ${lowest.retailer}, ${JSON.stringify(prices)}, ${prices.length}, NOW())
      ON CONFLICT (token) DO UPDATE SET
        lowest_price = EXCLUDED.lowest_price,
        lowest_retailer = EXCLUDED.lowest_retailer,
        all_prices = EXCLUDED.all_prices,
        retailer_count = EXCLUDED.retailer_count,
        updated_at = NOW()
    `;

    const result = {
      lowestPrice: lowest.price,
      lowestRetailer: lowest.retailer,
      allPrices: prices,
      retailerCount: prices.length,
    };
    memCache.set(token, { data: result, ts: Date.now() });

    return NextResponse.json(result);
  } catch (err) {
    console.error("product-prices error:", err);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
