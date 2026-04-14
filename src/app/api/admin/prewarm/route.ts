import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TOP_SEARCHES = [
  // Travel
  "pram", "pushchair", "double pram", "travel system", "baby carrier",
  "car seat", "isofix car seat", "infant car seat", "booster seat",
  "baby carrier wrap", "baby sling", "buggy board", "pram accessories",
  "Silver Cross pram", "iCandy pram", "Bugaboo pram", "Uppababy pram",
  "Joie pram", "Cosatto pram", "Ickle Bubba pram", "Cybex pram",
  "Maxi-Cosi car seat", "Joie car seat", "Britax car seat",
  // Sleep
  "moses basket", "baby cot bed", "bedside crib", "baby monitor",
  "video baby monitor", "white noise machine", "baby swaddle",
  "sleeping bag baby", "baby sleep suit", "night light baby",
  "snuzpod", "sleepyhead", "baby hammock", "cot mattress",
  "Ewan dream sheep", "baby blackout blind",
  // Feeding
  "baby bottle", "breast pump", "electric breast pump", "bottle steriliser",
  "high chair", "baby weaning set", "baby bib", "baby formula",
  "bottle warmer", "nursing pillow", "baby food maker",
  "Tommee Tippee bottles", "MAM bottles", "Medela breast pump",
  "Philips Avent bottles", "baby led weaning", "sippy cup",
  // Safety & Health
  "baby gate", "stair gate", "baby monitor breathing", "baby thermometer",
  "baby proofing kit", "baby first aid kit", "baby nail file",
  "baby nose cleaner", "nappy rash cream", "baby vitamin drops",
  // Play & Development
  "baby bouncer", "baby play gym", "baby walker", "baby swing",
  "sensory toys baby", "baby rattle", "teething toy", "baby activity centre",
  "baby jumperoo", "play mat baby", "tummy time mat",
  "baby soft toys", "baby musical toy", "stacking cups baby",
  // Nursery
  "baby changing table", "nursing chair", "baby wardrobe",
  "baby night light", "baby mobile", "changing mat", "baby storage",
  "baby dresser", "nursery rug", "nursery curtains",
  // Bathing & Hygiene
  "baby bath", "baby bath seat", "baby towel", "nappy bin",
  "baby wipes", "nappies newborn", "Pampers nappies", "Huggies nappies",
  "baby shampoo", "baby bath wash", "changing bag",
  // Clothing
  "baby sleepsuit", "baby vest", "babygrow", "newborn clothes set",
  "baby hat mittens", "baby snowsuit", "baby outfit",
  // Maternity
  "maternity pillow", "maternity bra", "nursing bra",
  "maternity leggings", "pregnancy support belt",
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

      // Skip if already cached and fresh (within 20hrs)
      const [existing] = await sql`
        SELECT updated_at FROM search_cache WHERE query = ${norm} LIMIT 1
      `;
      if (existing) {
        const ageHours = (Date.now() - new Date(existing.updated_at).getTime()) / (1000 * 60 * 60);
        if (ageHours < 20) { skipped++; continue; }
      }

      const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(norm + " baby")}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=40`;
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

      await new Promise(r => setTimeout(r, 200));
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ ok: true, warmed, skipped, errors, total: TOP_SEARCHES.length });
}
