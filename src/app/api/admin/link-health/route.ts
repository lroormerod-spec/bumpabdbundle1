import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const [cachedCount] = await sql`SELECT COUNT(*) as count FROM link_cache`;
    const [failureCount] = await sql`SELECT COUNT(*) as count FROM link_failures`;
    const failures = await sql`
      SELECT product_title, retailer, reason, created_at 
      FROM link_failures 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    return NextResponse.json({
      cached: Number(cachedCount.count),
      total: Number(failureCount.count),
      failures,
    });
  } catch (err) {
    console.error("link-health error:", err);
    return NextResponse.json({ cached: 0, total: 0, failures: [] });
  }
}
