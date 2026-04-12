import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { registries, items } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import RegistryClient from "@/components/RegistryClient";

export const metadata: Metadata = {
  title: "My Registry",
  robots: { index: false, follow: false },
};

export default async function RegistryPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const userRegistries = await db
    .select()
    .from(registries)
    .where(eq(registries.userId, session.userId));

  const firstRegistry = userRegistries[0] || null;

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
