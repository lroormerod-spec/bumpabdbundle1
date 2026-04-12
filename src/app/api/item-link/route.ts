import { NextRequest, NextResponse } from "next/server";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function getDirectLink(title: string, retailer?: string): Promise<{ link: string | null; price: string | null; retailer: string | null }> {
  // Step 1: Search Google Shopping to get product token
  const query = retailer ? `${title} ${retailer}` : title;
  const searchUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=uk&hl=en&api_key=${SERPAPI_KEY}&num=3`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const products = searchData.shopping_results || [];

  // Find best matching product (prefer one matching retailer if specified)
  const product = retailer
    ? products.find((p: any) => p.source?.toLowerCase().includes(retailer.toLowerCase().split(".")[0])) || products[0]
    : products[0];

  if (!product?.immersive_product_page_token) {
    return { link: null, price: product?.price || null, retailer: product?.source || null };
  }

  // Step 2: Get direct retailer links via immersive product API
  const immersiveUrl = `https://serpapi.com/search.json?engine=google_immersive_product&page_token=${encodeURIComponent(product.immersive_product_page_token)}&api_key=${SERPAPI_KEY}`;
  const immersiveRes = await fetch(immersiveUrl);
  const immersiveData = await immersiveRes.json();
  const stores: any[] = immersiveData.product_results?.stores || [];

  if (!stores.length) return { link: null, price: product?.price || null, retailer: product?.source || null };

  // Find the best price store, or the one matching the requested retailer
  let bestStore = stores[0];
  if (retailer) {
    const match = stores.find(s => s.name?.toLowerCase().includes(retailer.toLowerCase().split(".")[0]));
    if (match) bestStore = match;
  }

  // Find cheapest overall
  const cheapest = stores.reduce((a: any, b: any) => (a.extracted_price || 999) < (b.extracted_price || 999) ? a : b);

  // Use matched retailer if found, otherwise cheapest
  const chosen = bestStore || cheapest;

  return {
    link: chosen.link || null,
    price: chosen.price || null,
    retailer: chosen.name || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");
    const retailer = searchParams.get("retailer") || undefined;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const result = await getDirectLink(title, retailer);
    return NextResponse.json(result);
  } catch (err) {
    console.error("item-link error:", err);
    return NextResponse.json({ link: null, price: null, retailer: null });
  }
}
