import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TOP_SEARCHES = [
  // Travel
  "pram UK", "baby pushchair", "double pram", "travel system", "baby carrier wrap",
  "car seat infant", "isofix car seat", "booster seat baby",
  // Sleep
  "moses basket", "baby cot bed", "bedside crib", "baby monitor video",
  "white noise machine baby", "baby swaddle blanket", "sleeping bag baby",
  // Feeding
  "baby bottle set", "breast pump electric", "bottle steriliser",
  "baby formula milk", "high chair baby", "baby weaning set", "baby bib set",
  // Safety
  "baby gate stairgate", "baby monitor breathing", "baby thermometer",
  "socket covers baby", "baby proofing kit",
  // Play & Development
  "baby bouncer", "baby play gym mat", "baby walker",
  "baby swing chair", "sensory toys baby", "stacking toys baby",
  // Nursery
  "baby changing table", "nursing pillow", "baby wardrobe",
  "baby night light", "baby mobile cot",
  // Bathing & Hygiene
  "baby bath seat", "baby bath towel", "nappy bin",
  "baby wipes bulk", "nappies newborn",
  // Health
  "baby nail file", "baby nose cleaner", "baby grooming kit",
  "nappy rash cream", "baby vitamin drops",
  // Popular brands
  "Uppababy pram", "Joie car seat", "Tommee Tippee set",
  "MAM bottles", "Chicco baby", "Silver Cross pram",
  "Cybex car seat", "Ewan dream sheep",
];

export async function POST() {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  const sql = neon(process.env.DATABASE_URL!);

  let warmed = 0;
  let skipped = 0;
  let errors = 0;

  for (const query of TOP_SEARCHES) {
    try {
      const norm = query.toLowerCase().trim();

      // Skip if already cached and fresh
      const [existing] = await sql`
        SELECT updated_at FROM search_cache WHERE query = ${norm} LIMIT 1
      `;
      if (existing) {
        const ageHours = (Date.now() - new Date(existing.updated_at).getTime()) / (1000 * 60 * 60);
        if (ageHours < 6) { skipped++; continue; }
      }

      // Fetch from SerpAPI
      const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(norm)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=40`;
      const res = await fetch(url);
      const data = await res.json();
      const results = (data.shopping_results || []).map((item: any) => ({
        title: item.title,
        price: parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || null,
        priceStr: item.price,
        image: item.thumbnail,
        retailer: item.source,
        link: item.link || item.product_link,
        immersiveToken: item.immersive_product_page_token,
      }));

      await sql`
        INSERT INTO search_cache (query, results, updated_at) VALUES (${norm}, ${JSON.stringify(results)}, NOW())
        ON CONFLICT (query) DO UPDATE SET results = EXCLUDED.results, updated_at = NOW()
      `;
      warmed++;

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 250));
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ ok: true, warmed, skipped, errors, total: TOP_SEARCHES.length });
}
