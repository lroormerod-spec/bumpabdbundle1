import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const serpApiKey = process.env.SERPAPI_KEY;
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&gl=uk&hl=en&api_key=${serpApiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Search failed" }, { status: 502 });
    }

    const data = await response.json();
    const results = (data.shopping_results || []).slice(0, 20).map((item: Record<string, unknown>) => ({
      title: item.title,
      price: parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || null,
      priceStr: item.price,
      image: item.thumbnail,
      retailer: item.source,
      link: item.link || item.product_link,
      position: item.position,
    }));

    // Mark the cheapest result
    const prices = results.map((r: { price: number | null }) => r.price).filter((p: number | null): p is number => p !== null);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

    const annotated = results.map((r: { price: number | null; isLowest?: boolean }) => ({
      ...r,
      isLowest: lowestPrice !== null && r.price === lowestPrice,
    }));

    return NextResponse.json({ results: annotated });
  } catch (err) {
    console.error("search error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
