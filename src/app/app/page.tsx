import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registries, items, blogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) redirect("/");

  const userRegistries = await db.select().from(registries).where(eq(registries.userId, user.id));
  let firstRegistry = userRegistries[0] || null;

  // Auto-create registry for invited users who don't have one
  if (!firstRegistry) {
    const [created] = await db.insert(registries).values({
      userId: user.id,
      title: `${user.name || "My"} Registry`,
      parentNames: user.name || "",
      shareSlug: Math.random().toString(36).slice(2, 10),
    }).returning();
    firstRegistry = created;
  }

  let registryItems: typeof items.$inferSelect[] = [];
  if (firstRegistry) {
    registryItems = await db.select().from(items).where(eq(items.registryId, firstRegistry.id));
  }

  const latestPosts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      author: blogPosts.author,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt))
    .limit(3);

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, email: user.email, onboarded: user.onboarded }}
      registry={firstRegistry}
      items={registryItems}
      latestPosts={latestPosts}
    />
  );
}
