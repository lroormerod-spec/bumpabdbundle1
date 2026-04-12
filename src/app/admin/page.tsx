import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registries, items, blogPosts } from "@/lib/schema";
import { count, eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Basic Auth handled by middleware — no session check needed

  const [usersCount] = await db.select({ count: count() }).from(users);
  const [registriesCount] = await db.select({ count: count() }).from(registries);
  const [itemsCount] = await db.select({ count: count() }).from(items);
  const [postsCount] = await db.select({ count: count() }).from(blogPosts);

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(50);
  const allPosts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const allRegistries = await db.select().from(registries).orderBy(desc(registries.createdAt)).limit(50);

  return (
    <AdminClient
      stats={{
        users: Number(usersCount.count),
        registries: Number(registriesCount.count),
        items: Number(itemsCount.count),
        posts: Number(postsCount.count),
      }}
      users={allUsers}
      posts={allPosts}
      registries={allRegistries}
    />
  );
}
