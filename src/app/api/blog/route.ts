import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(posts);
  } catch (err) {
    console.error("GET /api/blog:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
