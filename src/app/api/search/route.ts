import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const CACHE_TTL_HOURS = 6;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

function normaliseQuery(q: string) {
  return q.toLowerCase().trim().replace(/\s+/g, " ");
}

function annotateResults(results: any[]) {
  const prices = results.map((r: any) => r.price).filter((p: number | null): p is number => p !== null);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  return results.map((r: any) => ({ ...r, isLowest: lowestPrice !== null && r.price === lowestPrice }));
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

    if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const normalisedQuery = normaliseQuery(q);
    const cacheKey = page > 1 ? `${normalisedQuery}__page${page}` : normalisedQuery;

    const sql = neon(process.env.DATABASE_URL!);

    // ── Check cache ──────────────────────────────────────────────────────────
    const [cached] = await sql`
      SELECT results, updated_at, hit_count 
      FROM search_cache 
      WHERE query = ${cacheKey}
      LIMIT 1
    `;

    if (cached) {
      const ageHours = (Date.now() - new Date(cached.updated_at).getTime()) / (1000 * 60 * 60);

      if (ageHours < CACHE_TTL_HOURS) {
        // Fresh cache hit — return immediately, bump hit count async
        sql`UPDATE search_cache SET hit_count = hit_count + 1 WHERE query = ${cacheKey}`.catch(() => {});
        const results = annotateResults(cached.results as any[]);
        return NextResponse.json({
          results,
          page,
          hasMore: results.length === 40,
          cached: true,
        });
      }

      // Stale — return stale results immediately, refresh in background
      const staleResults = annotateResults(cached.results as any[]);
      // Background refresh (don't await)
      fetchFromSerpApi(normalisedQuery, page).then(fresh => {
        sql`
          INSERT INTO search_cache (query, results, updated_at) VALUES (${cacheKey}, ${JSON.stringify(fresh)}, NOW())
          ON CONFLICT (query) DO UPDATE SET results = EXCLUDED.results, updated_at = NOW(), hit_count = search_cache.hit_count + 1
        `.catch(() => {});
      }).catch(() => {});

      return NextResponse.json({
        results: staleResults,
        page,
        hasMore: staleResults.length === 40,
        cached: true,
      });
    }

    // ── Cache miss — fetch live ───────────────────────────────────────────────
    const results = await fetchFromSerpApi(normalisedQuery, page);

    // Store in cache async (don't block the response)
    sql`
      INSERT INTO search_cache (query, results, updated_at) VALUES (${cacheKey}, ${JSON.stringify(results)}, NOW())
      ON CONFLICT (query) DO UPDATE SET results = EXCLUDED.results, updated_at = NOW(), hit_count = search_cache.hit_count + 1
    `.catch(() => {});

    return NextResponse.json({
      results: annotateResults(results),
      page,
      hasMore: results.length === 40,
      cached: false,
    });
  } catch (err) {
    console.error("search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
