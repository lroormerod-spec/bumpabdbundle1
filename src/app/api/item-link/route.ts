import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");
    const retailer = searchParams.get("retailer");

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const query = retailer ? `${title} site:${retailer}` : title;
    const serpApiKey = process.env.SERPAPI_KEY;
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=uk&hl=en&api_key=${serpApiKey}&num=1`;

    const response = await fetch(url);
    if (!response.ok) return NextResponse.json({ link: null });

    const data = await response.json();
    const first = data.shopping_results?.[0];

    return NextResponse.json({
      link: first?.link || first?.product_link || null,
      price: first?.price || null,
    });
  } catch (err) {
    console.error("item-link error:", err);
    return NextResponse.json({ link: null });
  }
}
