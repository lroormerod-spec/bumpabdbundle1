"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, Trash2, CheckCircle, ExternalLink, ShoppingBag,
  Loader2, Share2, Bell, BellOff, Package, X,
} from "lucide-react";
import { toast } from "sonner";
import ShareSheet from "@/components/ShareSheet";

interface SearchResult {
  title: string;
  price: number | null;
  priceStr: unknown;
  image: string | null;
  retailer: string | null;
  link: string | null;
  isLowest: boolean;
}

interface RegistryItem {
  id: number;
  title: string;
  price: number | null;
  image: string | null;
  retailer: string | null;
  url: string | null;
  category: string;
  isPurchased: boolean;
  priceAlert: boolean;
}

interface Registry {
  id: number;
  title: string;
  shareSlug: string;
  dueDate: string | null;
}

interface Props {
  registry: Registry | null;
  initialItems: RegistryItem[];
}

const POPULAR_SEARCHES = [
  "Pram",
  "Baby monitor",
  "Moses basket",
  "Car seat",
  "Feeding set",
  "Bouncer",
];

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
}

/** Skeleton card shown while loading */
function ResultSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-full mt-1" />
      </div>
    </div>
  );
}

export default function RegistryClient({ registry, initialItems }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState(""); // what was last actually searched
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [myItems, setMyItems] = useState<RegistryItem[]>(initialItems);
  const [adding, setAdding] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /** Core search function — called after debounce */
  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) return;

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setSearching(true);
    setHasSearched(true);
    setResultsVisible(false); // briefly hide for fade-in effect

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, {
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results || []);
      setCommittedQuery(q.trim());
      // Small delay so the DOM can mount before fading in
      requestAnimationFrame(() => setResultsVisible(true));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // silently ignore cancelled requests
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  /** Debounce on every keystroke */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 3) {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
        setResultsVisible(false);
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, runSearch]);

  /** Trigger popular chip immediately (no debounce) */
  function handleChipClick(chip: string) {
    setSearchQuery(chip);
    // Focus input for accessibility
    inputRef.current?.focus();
    // Run immediately — bypass the debounce
    runSearch(chip);
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setResultsVisible(false);
    inputRef.current?.focus();
  }

  async function addToRegistry(result: SearchResult) {
    if (!registry) {
      toast.error("No registry found");
      return;
    }
    const key = result.title;
    setAdding(key);
    try {
      const res = await fetch(`/api/registries/${registry.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          price: result.price,
          image: result.image,
          retailer: result.retailer,
          url: result.link,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMyItems(prev => [data, ...prev]);
      toast.success("Added to registry!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAdding(null);
    }
  }

  async function togglePurchased(item: RegistryItem) {
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPurchased: !item.isPurchased }),
      });
      const data = await res.json();
      setMyItems(prev => prev.map(i => i.id === item.id ? { ...i, isPurchased: data.isPurchased } : i));
    } catch {
      toast.error("Failed to update item");
    }
  }

  async function toggleAlert(item: RegistryItem) {
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceAlert: !item.priceAlert }),
      });
      const data = await res.json();
      setMyItems(prev => prev.map(i => i.id === item.id ? { ...i, priceAlert: data.priceAlert } : i));
      toast.success(data.priceAlert ? "Price alert enabled" : "Price alert disabled");
    } catch {
      toast.error("Failed to update alert");
    }
  }

  async function removeItem(itemId: number) {
    try {
      await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      setMyItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  }

  const shareUrl = registry
    ? `${typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://bumpandbundle.com"}/share/${registry.shareSlug}`
    : "";

  const showEmptyState = !searching && hasSearched && searchResults.length === 0;
  const showIdleState = !searching && !hasSearched && searchQuery.length === 0;
  const showBelowMinimum = !searching && !hasSearched && searchQuery.length > 0 && searchQuery.trim().length < 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{registry?.title || "My Registry"}</h1>
          <p className="text-muted-foreground">
            {myItems.length} items · {myItems.filter(i => i.isPurchased).length} purchased
          </p>
        </div>
        {registry && (
          <Button variant="outline" onClick={() => setShowShare(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share registry
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-1.5" />
            Search products
          </TabsTrigger>
          <TabsTrigger value="list">
            <Package className="w-4 h-4 mr-1.5" />
            My list ({myItems.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── SEARCH TAB ─── */}
        <TabsContent value="search" className="mt-6 space-y-5">

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search for baby items… e.g. Bugaboo pram"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-12 pl-10 pr-10 text-base rounded-xl border-border focus-visible:ring-primary/50"
              autoComplete="off"
            />
            {/* Clear button */}
            {searchQuery.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Popular searches — shown when input is empty */}
          {showIdleState && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium mr-1">Popular:</span>
              {POPULAR_SEARCHES.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 text-sm font-medium transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Below-minimum hint */}
          {showBelowMinimum && (
            <p className="text-sm text-muted-foreground pl-1">
              Keep typing to search…
            </p>
          )}

          {/* Loading skeletons — 3 cards */}
          {searching && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ResultSkeleton />
                <ResultSkeleton />
                <ResultSkeleton />
              </div>
            </div>
          )}

          {/* Result count */}
          {!searching && searchResults.length > 0 && (
            <p className="text-sm text-muted-foreground pl-0.5">
              Showing{" "}
              <span className="font-semibold text-foreground">{searchResults.length}</span>{" "}
              results for{" "}
              <span className="font-semibold text-foreground">&ldquo;{committedQuery}&rdquo;</span>
            </p>
          )}

          {/* Results grid — fades in */}
          {!searching && searchResults.length > 0 && (
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300"
              style={{ opacity: resultsVisible ? 1 : 0 }}
            >
              {searchResults.map((result, i) => (
                <Card
                  key={i}
                  className="overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative">
                    {result.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full h-44 object-contain bg-muted p-2"
                      />
                    ) : (
                      <div className="w-full h-44 bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    {result.isLowest && (
                      <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs shadow">
                        Lowest price
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm line-clamp-2 mb-2 leading-snug">{result.title}</p>
                    <div className="flex items-center justify-between mb-3">
                      {result.price ? (
                        <span className="text-lg font-bold text-primary">{formatPrice(result.price)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Price unavailable</span>
                      )}
                      {result.retailer && (
                        <span className="text-xs text-muted-foreground truncate ml-2 max-w-[100px]">{result.retailer}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => addToRegistry(result)}
                        disabled={adding === result.title}
                      >
                        {adding === result.title ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1">{adding === result.title ? "Adding…" : "Add to list"}</span>
                      </Button>
                      {result.link && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`/go?url=${encodeURIComponent(result.link)}&retailer=${encodeURIComponent(result.retailer ?? "")}&title=${encodeURIComponent(result.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on retailer site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state — no results found */}
          {showEmptyState && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">
                No results for &ldquo;{committedQuery}&rdquo;
              </p>
              <p className="text-sm mb-5">
                Try different keywords, or browse popular searches below.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.filter(c => c.toLowerCase() !== committedQuery.toLowerCase()).map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 text-sm font-medium transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Idle state — nothing typed yet */}
          {showIdleState && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">
                Find anything for your baby registry
              </p>
              <p className="text-sm">
                We compare prices live across 14 UK retailers — Amazon, John Lewis, Mamas &amp; Papas, and more
              </p>
            </div>
          )}
        </TabsContent>

        {/* ─── MY LIST TAB ─── */}
        <TabsContent value="list" className="mt-6">
          {myItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-primary/30" />
              <p className="text-lg font-medium mb-1">Your registry is empty</p>
              <p className="text-sm mb-6">Search for items and add them to your list</p>
              <Button onClick={() => setActiveTab("search")}>
                <Search className="w-4 h-4 mr-2" />
                Search products
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.isPurchased ? "opacity-60 bg-muted/40" : "bg-card hover:shadow-sm"
                  }`}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded-lg bg-muted flex-shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm line-clamp-1 ${item.isPurchased ? "line-through" : ""}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.price && (
                        <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
                      )}
                      {item.retailer && (
                        <span className="text-xs text-muted-foreground">{item.retailer}</span>
                      )}
                      {item.isPurchased && (
                        <Badge variant="secondary" className="text-xs text-green-700 bg-green-50">
                          Purchased
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`/go?url=${encodeURIComponent(item.url)}&retailer=${encodeURIComponent(item.retailer ?? "")}&title=${encodeURIComponent(item.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on retailer site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAlert(item)}
                      title={item.priceAlert ? "Disable price alert" : "Enable price alert"}
                    >
                      {item.priceAlert ? (
                        <Bell className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePurchased(item)}
                      title={item.isPurchased ? "Mark as not purchased" : "Mark as purchased"}
                    >
                      <CheckCircle
                        className={`w-3.5 h-3.5 ${item.isPurchased ? "text-green-600" : "text-muted-foreground"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showShare && registry && (
        <ShareSheet
          url={shareUrl}
          title={registry.title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
