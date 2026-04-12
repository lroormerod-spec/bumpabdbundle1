import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { registries, items, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import RegistryClient from "@/components/RegistryClient";

export const metadata: Metadata = {
  title: "My Registry",
  robots: { index: false, follow: false },
};

function generateSlug() {
  return Math.random().toString(36).slice(2, 10);
}

export default async function RegistryPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const userRegistries = await db
    .select()
    .from(registries)
    .where(eq(registries.userId, session.userId));

  let firstRegistry = userRegistries[0] || null;

  // Auto-create a registry for users who don't have one (e.g. invited via magic link)
  if (!firstRegistry) {
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    const [created] = await db.insert(registries).values({
      userId: session.userId,
      title: `${user?.name || "My"} Registry`,
      parentNames: user?.name || "",
      shareSlug: generateSlug(),
    }).returning();
    firstRegistry = created;
  }

  let registryItems: typeof items.$inferSelect[] = [];
  if (firstRegistry) {
    registryItems = await db
      .select()
      .from(items)
      .where(eq(items.registryId, firstRegistry.id));
  }

  return (
    <RegistryClient
      registry={firstRegistry}
      initialItems={registryItems}
    />
  );
}
