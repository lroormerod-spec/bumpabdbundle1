import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, registries, items, blogPosts } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [usersCount] = await db.select({ count: count() }).from(users);
    const [registriesCount] = await db.select({ count: count() }).from(registries);
    const [itemsCount] = await db.select({ count: count() }).from(items);
    const [postsCount] = await db.select({ count: count() }).from(blogPosts);

    return NextResponse.json({
      users: usersCount.count,
      registries: registriesCount.count,
      items: itemsCount.count,
      posts: postsCount.count,
    });
  } catch (err) {
    console.error("GET /api/admin/stats:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
