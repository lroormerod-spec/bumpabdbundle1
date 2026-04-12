import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { registries, items, users, giftClaims } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import SharePageClient from "@/components/SharePageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;

  const [registry] = await db
    .select()
    .from(registries)
    .where(eq(registries.shareSlug, slug))
    .limit(1);

  if (!registry) notFound();

  const registryItems = await db
    .select()
    .from(items)
    .where(eq(items.registryId, registry.id));

  const [owner] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, registry.userId))
    .limit(1);

  const ownerName = owner?.name || registry.parentNames || "the parents";

  // Load all active claims for unpurchased items so the share page
  // can show reserved / purchased states on first render
  const itemIds = registryItems.filter(i => !i.isPurchased).map(i => i.id);
  const existingClaims = itemIds.length > 0
    ? await db
        .select({
          itemId: giftClaims.itemId,
          gifterName: giftClaims.gifterName,
          status: giftClaims.status,
        })
        .from(giftClaims)
        .where(
          and(
            inArray(giftClaims.itemId, itemIds),
            inArray(giftClaims.status, ["reserved", "purchased"])
          )
        )
    : [];

  return (
    <SharePageClient
      registry={{
        id: registry.id,
        title: registry.title,
        dueDate: registry.dueDate ?? null,
        message: registry.message ?? null,
        parentNames: registry.parentNames,
        shareSlug: registry.shareSlug,
      }}
      registryItems={registryItems.map(i => ({
        id: i.id,
        title: i.title,
        price: i.price ?? null,
        image: i.image ?? null,
        retailer: i.retailer ?? null,
        url: i.url ?? null,
        isPurchased: i.isPurchased,
        purchasedBy: i.purchasedBy ?? null,
        category: i.category,
      }))}
      ownerName={ownerName}
      existingClaims={existingClaims}
    />
  );
}
