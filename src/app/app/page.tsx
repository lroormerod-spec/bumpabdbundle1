import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registries, items } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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
  const firstRegistry = userRegistries[0] || null;

  let registryItems: typeof items.$inferSelect[] = [];
  if (firstRegistry) {
    registryItems = await db.select().from(items).where(eq(items.registryId, firstRegistry.id));
  }

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, email: user.email, onboarded: user.onboarded }}
      registry={firstRegistry}
      items={registryItems}
    />
  );
}
