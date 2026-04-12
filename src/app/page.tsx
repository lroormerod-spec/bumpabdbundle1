import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Bump & Bundle — UK Baby Registry",
  description:
    "Create your perfect baby registry. Compare prices across 14 UK retailers, share with family and friends, and get alerts when prices drop.",
};

export default async function HomePage() {
  const latestPosts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      author: blogPosts.author,
      createdAt: blogPosts.createdAt,
      content: blogPosts.content,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt))
    .limit(3);

  return <HomePageClient latestPosts={latestPosts} />;
}
