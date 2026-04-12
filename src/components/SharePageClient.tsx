"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  ExternalLink,
  Gift,
  Heart,
  ShoppingBag,
  Lock,
  Loader2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

interface Item {
  id: number;
  title: string;
  price: number | null;
  image: string | null;
  retailer: string | null;
  url: string | null;
  isPurchased: boolean;
  purchasedBy: string | null;
  category: string;
}

interface GiftClaim {
  itemId: number;
  gifterName: string;
  status: string; // "reserved" | "purchased"
}

interface Registry {
  id: number;
  title: string;
  dueDate: string | null;
  message: string | null;
  parentNames: string;
  shareSlug: string;
}

interface Props {
  registry: Registry;
  registryItems: Item[];
  ownerName: string;
  existingClaims: GiftClaim[];
}

type ModalStep = "name" | "buy" | "confirmed";

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
}

export default function SharePageClient({ registry, registryItems, ownerName, existingClaims }: Props) {
  // Local state for claims so UI updates instantly without a full page refresh
  const [claims, setClaims] = useState<GiftClaim[]>(existingClaims);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("name");
  const [gifterName, setGifterName] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const available = registryItems.filter((i) => !i.isPurchased);
  const purchased = registryItems.filter((i) => i.isPurchased);

  function getItemClaim(itemId: number): GiftClaim | undefined {
    return claims.find((c) => c.itemId === itemId && (c.status === "reserved" || c.status === "purchased"));
  }

  function openModal(item: Item) {
    setSelectedItem(item);
    setModalStep("name");
    setGifterName("");
    setNameError("");
    setClaimToken(null);
    setConfirmError("");
  }

  function closeModal() {
    setSelectedItem(null);
    setClaimToken(null);
    setGifterName("");
    setNameError("");
    setConfirmError("");
  }

  async function handleReserve() {
    if (!gifterName.trim()) {
      setNameError("Please enter your name so we can let the parents know.");
      return;
    }
    setNameError("");
    setLoading(true);

    try {
      const res = await fetch("/api/gift/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem!.id,
          gifterName: gifterName.trim(),
          registryId: registry.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setNameError("Someone just reserved this item — it may no longer be available. Refresh to see the latest.");
        } else {
          setNameError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setClaimToken(data.token);
      // Optimistically add the claim locally
      setClaims((prev) => [...prev, { itemId: selectedItem!.id, gifterName: gifterName.trim(), status: "reserved" }]);
      setModalStep("buy");
    } catch {
      setNameError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPurchase() {
    if (!claimToken) return;
    setConfirmLoading(true);
    setConfirmError("");

    try {
      const res = await fetch("/api/gift/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: claimToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConfirmError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Update local claims to purchased
      setClaims((prev) =>
        prev.map((c) =>
          c.itemId === selectedItem!.id ? { ...c, status: "purchased" } : c
        )
      );
      setModalStep("confirmed");
    } catch {
      setConfirmError("Something went wrong. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  }

  const buyUrl = selectedItem?.url
    ? `/go?url=${encodeURIComponent(selectedItem.url)}&retailer=${encodeURIComponent(selectedItem.retailer ?? "")}&title=${encodeURIComponent(selectedItem.title)}`
    : null;

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
              {available.map((item) => {
                const claim = getItemClaim(item.id);
                const isReserved = claim?.status === "reserved";
                const isPurchasedByGifter = claim?.status === "purchased";

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden hover:shadow-md transition-shadow ${isReserved || isPurchasedByGifter ? "opacity-70" : ""}`}
                  >
                    <CardContent className="p-0 flex">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="w-28 h-28 object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-28 h-28 bg-muted flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-medium text-sm line-clamp-2 mb-1">{item.title}</p>
                          {item.price && (
                            <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                          )}
                        </div>

                        <div className="mt-3">
                          {isReserved ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Reserved by {claim!.gifterName}</span>
                            </div>
                          ) : isPurchasedByGifter ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Bought by {claim!.gifterName}</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full text-xs h-8"
                              onClick={() => openModal(item)}
                            >
                              <Gift className="w-3.5 h-3.5 mr-1.5" />
                              I&apos;d like to buy this
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
          Powered by <Link href="/" className="text-primary hover:underline">Bump &amp; Bundle</Link>
        </div>
      </footer>

      {/* Gift claim modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="sm:max-w-md">
          {modalStep === "name" && (
            <>
              <DialogHeader>
                <DialogTitle>Reserve this gift</DialogTitle>
                <DialogDescription>
                  Let the parents know you&apos;re buying this — it will be marked as reserved so nobody else buys it too.
                </DialogDescription>
              </DialogHeader>

              {selectedItem && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  {selectedItem.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedItem.image} alt={selectedItem.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{selectedItem.title}</p>
                    {selectedItem.price && (
                      <p className="text-sm text-primary font-semibold mt-0.5">{formatPrice(selectedItem.price)}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium">Your name</label>
                <Input
                  placeholder="e.g. Sarah"
                  value={gifterName}
                  onChange={(e) => setGifterName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReserve()}
                  autoFocus
                />
                {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              </div>

              <Button onClick={handleReserve} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reserving...</>
                ) : (
                  <>Reserve &amp; buy <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </>
          )}

          {modalStep === "buy" && selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>You&apos;re all set, {gifterName.split(" ")[0]}!</DialogTitle>
                <DialogDescription>
                  Reserved in your name. Buy it, then come back here and tick it off — or save your personal link to confirm later.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                {selectedItem.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{selectedItem.title}</p>
                  {selectedItem.price && (
                    <p className="text-sm text-primary font-semibold mt-0.5">{formatPrice(selectedItem.price)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {buyUrl ? (
                  <Button className="w-full" asChild>
                    <a href={buyUrl} target="_blank" rel="noopener noreferrer">
                      View best current price <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No purchase link available for this item.</p>
                )}

                {/* Personal confirmation link — gifter can bookmark and return */}
                {claimToken && (
                  <div className="rounded-lg bg-muted/60 border border-border p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Your personal confirmation link</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {typeof window !== "undefined" ? `${window.location.origin}/gift/${claimToken}` : `/gift/${claimToken}`}
                    </p>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/gift/${claimToken}`);
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-background px-3">Once you&apos;ve purchased it</span>
                  </div>
                </div>

                <Button
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  variant="outline"
                  onClick={handleConfirmPurchase}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                  ) : (
                    <><PartyPopper className="w-4 h-4 mr-2" /> I&apos;ve bought it — tick it off</>
                  )}
                </Button>

                {confirmError && <p className="text-xs text-destructive text-center">{confirmError}</p>}
              </div>
            </>
          )}

          {modalStep === "confirmed" && (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl">🎁</div>
              <DialogTitle className="text-xl">Thank you, {gifterName.split(" ")[0]}!</DialogTitle>
              <p className="text-muted-foreground text-sm">
                You&apos;ve marked this as purchased. The parents will see it as gifted on their registry — they&apos;ll be so grateful!
              </p>
              <Button onClick={closeModal} className="w-full">
                <PartyPopper className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
