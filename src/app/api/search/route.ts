import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const CACHE_TTL_HOURS = 24; // Extended to 24hrs — baby product prices don't change hourly
const SERPAPI_KEY = process.env.SERPAPI_KEY;

// In-memory cache — survives across requests in the same Vercel instance
// Eliminates DB round-trip for repeat searches
const memCache = new Map<string, { results: any[]; ts: number }>();
const MEM_TTL_MS = 10 * 60 * 1000; // 10 minutes in memory

function normaliseQuery(q: string) {
  return q.toLowerCase().trim().replace(/\s+/g, " ");
}

// Well-known baby brands — no suffix needed, search as-is
const BABY_BRANDS = [
  "silver cross", "icandy", "uppababy", "bugaboo", "joie", "graco",
  "mamas and papas", "mamas & papas", "chicco", "tommee tippee", "medela",
  "mothercare", "snuzpod", "sleepyhead", "ergobaby", "babybjorn",
  "maxi-cosi", "maxicosi", "cybex", "britax", "cosatto", "hauck",
  "phil and teds", "mountain buggy", "ickle bubba", "munchkin",
];

// Words that already make a query clearly baby-related
const BABY_TERMS = [
  "baby", "newborn", "infant", "toddler", "nursery", "pram", "stroller",
  "pushchair", "buggy", "cot", "crib", "moses basket", "nappy", "diaper",
  "breast pump", "bottle", "steriliser", "sterilizer", "feeding", "weaning",
  "car seat", "bouncer", "highchair", "babygrow", "sleepsuit", "monitor",
  "maternity", "pregnancy", "swaddle", "wipes", "dummy", "teether",
  "rattle", "play mat", "baby monitor",
];

// Product types/keywords in titles that clearly indicate non-baby products
const EXCLUDE_TITLE_TERMS = [
  "bangle", "jewellery", "jewelry", "necklace", "bracelet", "earring",
  "pendant", "diamond", "gold chain", "silver chain", "sterling silver",
  "925 silver", "watch", "handbag", "purse", "perfume", "cologne",
  "makeup", "lipstick", "mascara", "eyeshadow", "foundation",
  "pet food", "dog food", "cat food", "adult toy", "lingerie",
  "ring", "tiara", "brooch", "anklet",
];

// Retailers known to sell non-baby products that slip through
const EXCLUDE_RETAILERS = [
  "EDS Jewels", "The Little Keeps", "Baby Bangles", "Jewellery",
];

function buildSearchQuery(q: string): string {
  const lower = q.toLowerCase();
  // Known baby brand — search as-is, no suffix
  if (BABY_BRANDS.some(brand => lower.includes(brand))) return q;
  // Already has baby context
  if (BABY_TERMS.some(term => lower.includes(term))) return q;
  // Ambiguous — append "baby" to force baby product context
  return `${q} baby`;
}

function filterBabyResults(results: any[]): any[] {
  return results.filter(r => {
    const title = (r.title || "").toLowerCase();
    const retailer = (r.retailer || "");
    // Block by title keywords
    if (EXCLUDE_TITLE_TERMS.some(term => title.includes(term))) return false;
    // Block by known non-baby retailers
    if (EXCLUDE_RETAILERS.some(ret => retailer.includes(ret))) return false;
    return true;
  });
}

// Known UK baby retailers for logo display
const RETAILER_LOGOS: Record<string, string> = {
  "amazon": "https://logo.clearbit.com/amazon.co.uk",
  "john lewis": "https://logo.clearbit.com/johnlewis.com",
  "argos": "https://logo.clearbit.com/argos.co.uk",
  "mamas & papas": "https://logo.clearbit.com/mamasandpapas.com",
  "mamas and papas": "https://logo.clearbit.com/mamasandpapas.com",
  "mothercare": "https://logo.clearbit.com/mothercare.com",
  "boots": "https://logo.clearbit.com/boots.com",
  "smyths": "https://logo.clearbit.com/smythstoys.com",
  "very": "https://logo.clearbit.com/very.co.uk",
  "next": "https://logo.clearbit.com/next.co.uk",
  "ebay": "https://logo.clearbit.com/ebay.co.uk",
  "tesco": "https://logo.clearbit.com/tesco.com",
  "asda": "https://logo.clearbit.com/asda.com",
  "george": "https://logo.clearbit.com/asda.com",
  "wayfair": "https://logo.clearbit.com/wayfair.co.uk",
  "dunelm": "https://logo.clearbit.com/dunelm.com",
  "bambino": "https://logo.clearbit.com/bambino.co.uk",
};

export function getRetailerLogo(retailer: string): string | null {
  if (!retailer) return null;
  const lower = retailer.toLowerCase();
  for (const [key, url] of Object.entries(RETAILER_LOGOS)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

function annotateResults(results: any[]) {
  const prices = results.map((r: any) => r.price).filter((p: number | null): p is number => p !== null);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

  // Group by normalised title to find same product at different retailers
  const titleMap = new Map<string, { retailer: string; price: number }[]>();
  for (const r of results) {
    if (!r.price || !r.retailer) continue;
    // Normalise title: lowercase, strip punctuation, first 60 chars
    const normTitle = r.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().slice(0, 60);
    if (!titleMap.has(normTitle)) titleMap.set(normTitle, []);
    titleMap.get(normTitle)!.push({ retailer: r.retailer, price: r.price });
  }

  // Count unique retailers across all results
  const uniqueRetailerCount = new Set(
    results.filter((r: any) => r.retailer).map((r: any) => r.retailer.toLowerCase().split(" ")[0])
  ).size;

  return results.map((r: any) => {
    const normTitle = r.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().slice(0, 60);
    const others = (titleMap.get(normTitle) || [])
      .filter(o => o.retailer !== r.retailer)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    return {
      ...r,
      isLowest: lowestPrice !== null && r.price === lowestPrice,
      otherPrices: others,
      retailerCount: uniqueRetailerCount,
    };
  });
}

// Fire-and-forget price enrichment for results with immersive tokens
function enrichResultsAsync(results: any[], baseUrl: string) {
  const toEnrich = results.filter(r => r.immersiveToken);
  if (toEnrich.length === 0) return;
  // Stagger requests to avoid rate limiting
  toEnrich.forEach((r, i) => {
    setTimeout(() => {
      fetch(`${baseUrl}/api/product-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: r.immersiveToken, title: r.title }),
      }).catch(() => {});
    }, i * 300); // 300ms apart
  });
}

async function fetchFromSerpApi(query: string, page = 1) {
  const start = (page - 1) * 40;
  const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=40&start=${start}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("SerpAPI error");
  const data = await response.json();

  return (data.shopping_results || []).map((item: any) => ({
    title: item.title,
    price: parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || null,
    priceStr: item.price,
    image: item.thumbnail,
    retailer: item.source,
    link: item.link || item.product_link,
    immersiveToken: item.immersive_product_page_token,
    position: item.position,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const baseUrl = request.headers.get("origin") || "https://bumpandbundle.com";

    if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const normalisedQuery = normaliseQuery(q);
    const searchQuery = buildSearchQuery(normalisedQuery);
    const cacheKey = page > 1 ? `${normalisedQuery}__page${page}` : normalisedQuery;

    // ── 1. Memory cache (fastest — no DB round trip) ─────────────────────────
    const mem = memCache.get(cacheKey);
    if (mem && Date.now() - mem.ts < MEM_TTL_MS) {
      return NextResponse.json({
        results: annotateResults(mem.results),
        page,
        hasMore: mem.results.length >= 40,
        cached: true,
      });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // ── 2. DB cache ───────────────────────────────────────────────────────────
    const [cached] = await sql`
      SELECT results, updated_at FROM search_cache WHERE query = ${cacheKey} LIMIT 1
    `;

    if (cached) {
      const ageHours = (Date.now() - new Date(cached.updated_at).getTime()) / (1000 * 60 * 60);
      const filtered = filterBabyResults(cached.results as any[]);

      // Store in memory for next request
      memCache.set(cacheKey, { results: filtered, ts: Date.now() });

      // Always return immediately — refresh in background if stale
      if (ageHours >= CACHE_TTL_HOURS) {
        fetchFromSerpApi(searchQuery, page).then(fresh => {
          const f = filterBabyResults(fresh);
          memCache.set(cacheKey, { results: f, ts: Date.now() });
          sql`
            INSERT INTO search_cache (query, results, updated_at) VALUES (${cacheKey}, ${JSON.stringify(f)}, NOW())
            ON CONFLICT (query) DO UPDATE SET results = EXCLUDED.results, updated_at = NOW(), hit_count = search_cache.hit_count + 1
          `.catch(() => {});
        }).catch(() => {});
      } else {
        sql`UPDATE search_cache SET hit_count = hit_count + 1 WHERE query = ${cacheKey}`.catch(() => {});
      }

      return NextResponse.json({
        results: annotateResults(filtered),
        page,
        hasMore: filtered.length >= 40,
        cached: true,
      });
    }

    // ── 3. Cache miss — fetch live from SerpAPI ───────────────────────────────
    const rawResults = await fetchFromSerpApi(searchQuery, page);
    const results = filterBabyResults(rawResults);

    // Store in both caches
    memCache.set(cacheKey, { results, ts: Date.now() });
    sql`
      INSERT INTO search_cache (query, results, updated_at) VALUES (${cacheKey}, ${JSON.stringify(results)}, NOW())
      ON CONFLICT (query) DO UPDATE SET results = EXCLUDED.results, updated_at = NOW(), hit_count = search_cache.hit_count + 1
    `.catch(() => {});

    const annotated = annotateResults(results);

    // Trigger background price enrichment for all results with immersive tokens
    enrichResultsAsync(annotated, baseUrl);

    return NextResponse.json({
      results: annotated,
      page,
      hasMore: results.length >= 40,
      cached: false,
    });
  } catch (err) {
    console.error("search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
