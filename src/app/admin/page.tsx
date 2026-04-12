import type { Metadata } from "next";
import { db } from "@/lib/db";
import { users, registries, items, blogPosts, affiliateClicks, pageContent } from "@/lib/schema";
import { count, eq, desc, sql } from "drizzle-orm";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [usersCount] = await db.select({ count: count() }).from(users);
  const [registriesCount] = await db.select({ count: count() }).from(registries);
  const [itemsCount] = await db.select({ count: count() }).from(items);
  const [postsCount] = await db.select({ count: count() }).from(blogPosts);

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200);
  const allPosts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const allRegistries = await db.select().from(registries).orderBy(desc(registries.createdAt)).limit(200);

  // Registry counts per user
  const regCounts = await db
    .select({
      userId: registries.userId,
      count: sql<number>`COUNT(*)::int`,
      latestDueDate: sql<string | null>`MAX(due_date)`,
    })
    .from(registries)
    .groupBy(registries.userId);

  // Item counts per user
  const itemCounts = await db
    .select({
      userId: registries.userId,
      itemCount: sql<number>`COUNT(${items.id})::int`,
      latestItemAt: sql<Date | null>`MAX(${items.createdAt})`,
    })
    .from(registries)
    .leftJoin(items, eq(items.registryId, registries.id))
    .groupBy(registries.userId);

  // Affiliate clicks
  const allClicks = await db.select().from(affiliateClicks).orderBy(desc(affiliateClicks.createdAt)).limit(200);

  // Page content
  const allPageContent = await db.select().from(pageContent).orderBy(pageContent.key);

  const regMap = new Map(regCounts.map((r) => [r.userId, r]));
  const itemMap = new Map(itemCounts.map((r) => [r.userId, r]));

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const enrichedUsers = allUsers.map((user) => {
    const reg = regMap.get(user.id);
    const itm = itemMap.get(user.id);
    const itemCount = itm?.itemCount ?? 0;
    const lastActive: Date | null = itm?.latestItemAt ?? null;
    const dueDate = reg?.latestDueDate ?? null;

    let segment: string;
    if (itemCount >= 10) {
      segment = "registry_complete";
    } else if (dueDate && new Date(dueDate) <= thirtyDaysFromNow && new Date(dueDate) >= now) {
      segment = "due_soon";
    } else if (lastActive && lastActive >= sevenDaysAgo && itemCount > 0) {
      segment = "active";
    } else if (reg && reg.count > 0 && itemCount === 0) {
      segment = "registered";
    } else if (user.createdAt && new Date(user.createdAt) <= sevenDaysAgo && itemCount === 0) {
      segment = "dormant";
    } else if (reg && reg.count > 0) {
      segment = "registered";
    } else {
      segment = "dormant";
    }

    return {
      ...user,
      registryCount: reg?.count ?? 0,
      itemCount,
      dueDate,
      lastActive,
      segment,
    };
  });

  return (
    <AdminClient
      stats={{
        users: Number(usersCount.count),
        registries: Number(registriesCount.count),
        items: Number(itemsCount.count),
        posts: Number(postsCount.count),
      }}
      users={enrichedUsers}
      posts={allPosts}
      registries={allRegistries}
      affiliateClicks={allClicks}
      pageContent={allPageContent}
    />
  );
}
