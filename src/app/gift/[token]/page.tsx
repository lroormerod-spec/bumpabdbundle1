"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  PartyPopper,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

interface ClaimData {
  claim: {
    id: number;
    gifterName: string;
    status: string;
    reservedAt: string;
    purchasedAt: string | null;
  };
  item: {
    id: number;
    title: string;
    image: string | null;
    price: number | null;
    url: string | null;
    retailer: string | null;
  } | null;
}

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
}

export default function GiftConfirmPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/gift/lookup?token=${token}`);
        if (!res.ok) {
          setError("We couldn't find this gift reservation. The link may be invalid.");
          return;
        }
        const json = await res.json();
        setData(json);
        if (json.claim?.status === "purchased") {
          setConfirmed(true);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError("");
    try {
      const res = await fetch("/api/gift/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) {
        setConfirmError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setConfirmed(true);
    } catch {
      setConfirmError("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  const buyUrl = data?.item?.url
    ? `/go?url=${encodeURIComponent(data.item.url)}&retailer=${encodeURIComponent(data.item.retailer ?? "")}&title=${encodeURIComponent(data.item.title)}`
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-lg mb-6">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                <ellipse cx="16" cy="20" rx="7" ry="9" fill="white" opacity="0.9"/>
                <circle cx="16" cy="8" r="5" fill="white" opacity="0.9"/>
                <ellipse cx="21" cy="22" rx="3" ry="2" fill="white" opacity="0.5"/>
              </svg>
            </div>
            Bump &amp; Bundle
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your gift reservation...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Reservation not found</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/">Go to Bump &amp; Bundle</Link>
            </Button>
          </div>
        )}

        {/* Confirmed already */}
        {!loading && !error && confirmed && (
          <div className="text-center space-y-5">
            <div className="text-6xl">🎁</div>
            <h1 className="text-2xl font-bold">Purchase confirmed!</h1>
            <p className="text-muted-foreground">
              Thanks, {data?.claim.gifterName.split(" ")[0]}! This gift has been marked as purchased on the registry. The parents will love it.
            </p>
            {data?.item && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-left">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="font-medium text-sm text-green-900">{data.item.title}</p>
              </div>
            )}
            <Button variant="outline" asChild>
              <Link href="/">Create your own registry</Link>
            </Button>
          </div>
        )}

        {/* Active reservation */}
        {!loading && !error && !confirmed && data && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                Your gift reservation
              </h1>
              <p className="text-muted-foreground text-sm">
                Hi {data.claim.gifterName.split(" ")[0]}! This item is reserved in your name.
              </p>
            </div>

            {/* Item card */}
            {data.item && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {data.item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.item.image}
                    alt={data.item.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                {!data.item.image && (
                  <div className="w-full h-36 bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-semibold">{data.item.title}</p>
                  {data.item.price && (
                    <p className="text-primary font-bold mt-1">{formatPrice(data.item.price)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {buyUrl && (
                <Button className="w-full" asChild>
                  <a href={buyUrl} target="_blank" rel="noopener noreferrer">
                    View best current price <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-background px-3">Once you&apos;ve purchased it</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                ) : (
                  <><PartyPopper className="w-4 h-4 mr-2" /> I&apos;ve bought it — tick it off</>
                )}
              </Button>

              {confirmError && (
                <p className="text-xs text-destructive text-center">{confirmError}</p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Bookmarking this page? You can come back here anytime to confirm your purchase.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
