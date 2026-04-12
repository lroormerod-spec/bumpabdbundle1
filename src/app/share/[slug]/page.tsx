import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { registries, items, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Gift, Heart, ShoppingBag } from "lucide-react";

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
  const available = registryItems.filter((i) => !i.isPurchased);
  const purchased = registryItems.filter((i) => i.isPurchased);

  function formatPrice(price: number | null) {
    if (!price) return null;
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-secondary/30 to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-4">🤰</div>
          <h1 className="text-3xl font-bold mb-2">{registry.title}</h1>
          <p className="text-muted-foreground text-lg mb-4">
            {ownerName}&apos;s baby registry
          </p>
          {registry.dueDate && (
            <Badge variant="secondary" className="text-sm">
              Due {new Date(registry.dueDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </Badge>
          )}
          {registry.message && (
            <p className="mt-4 text-muted-foreground italic max-w-lg mx-auto">&ldquo;{registry.message}&rdquo;</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-2xl font-bold text-primary">{registryItems.length}</div>
            <div className="text-sm text-muted-foreground">Total items</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-2xl font-bold text-green-600">{purchased.length}</div>
            <div className="text-sm text-muted-foreground">Purchased</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-2xl font-bold">{available.length}</div>
            <div className="text-sm text-muted-foreground">Still needed</div>
          </div>
        </div>

        {/* Available items */}
        {available.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Still needed ({available.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {available.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0 flex">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="w-28 h-28 object-cover flex-shrink-0" />
                    )}
                    {!item.image && (
                      <div className="w-28 h-28 bg-muted flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4 flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 mb-1">{item.title}</p>
                      {item.retailer && (
                        <p className="text-xs text-muted-foreground mb-2">{item.retailer}</p>
                      )}
                      {item.price && (
                        <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View best price <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Purchased items */}
        {purchased.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Already purchased ({purchased.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {purchased.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4 opacity-60 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                    {item.purchasedBy && (
                      <p className="text-xs text-muted-foreground">Gifted by {item.purchasedBy}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {registryItems.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary/30" />
            <p className="text-lg">This registry is being built — check back soon!</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary text-center border border-border">
          <h3 className="text-lg font-bold mb-2">Want to create your own baby registry?</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Compare prices across 14 UK retailers, share with family and friends — completely free.
          </p>
          <Button asChild>
            <Link href="/">
              <Gift className="w-4 h-4 mr-2" />
              Create my registry
            </Link>
          </Button>
        </div>
      </div>

      <footer className="border-t border-border py-6">
        <div className="text-center text-sm text-muted-foreground">
          Powered by <Link href="/" className="text-primary hover:underline">Bump & Bundle</Link>
        </div>
      </footer>
    </div>
  );
}
