"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  otherPrices?: { retailer: string; price: number }[];
  retailerCount?: number;
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

const CATEGORIES = [
  { label: "All", emoji: "" },
  { label: "Travel", emoji: "🚗" },
  { label: "Sleep", emoji: "😴" },
  { label: "Feeding", emoji: "🍼" },
  { label: "Safety", emoji: "🛡️" },
  { label: "Play", emoji: "🧸" },
  { label: "Clothing", emoji: "👕" },
  { label: "Nursery", emoji: "🛏️" },
  { label: "Bathing", emoji: "🛁" },
  { label: "Health", emoji: "❤️" },
];

function guessCategory(title: string, query: string): string {
  const text = (title + " " + query).toLowerCase();
  if (/pram|stroller|pushchair|car seat|travel|buggy|carrier|isofix|booster seat/.test(text)) return "Travel";
  if (/sleep|crib|bassinet|moses|cot|monitor|white noise|swaddle|sleeping bag|night light|lullaby/.test(text)) return "Sleep";
  if (/bottle|breast pump|feeding|formula|bib|highchair|weaning|sippy|warmer|steriliser|sterilizer|soother|pacifier|dummy|nursing|lactation|milk|expressing/.test(text)) return "Feeding";
  if (/gate|stairgate|socket|safe|safety|thermometer|medicine|first aid|baby proof/.test(text)) return "Safety";
  if (/toy|play|bouncer|gym|rattle|teether|activity|sensory|mobile|musical|soft toy/.test(text)) return "Play";
  if (/clothes|vest|babygrow|sleepsuit|outfit|clothing|hat|socks|mittens|romper|bodysuit/.test(text)) return "Clothing";
  if (/nursery|lamp|mobile cot|decor|storage|wardrobe|chest|drawer|rug|curtain/.test(text)) return "Nursery";
  if (/bath|towel|wash|shampoo|nappy|nappies|wipes|changing|mat|potty/.test(text)) return "Bathing";
  if (/health|vitamin|cream|lotion|nappy rash|baby oil|nasal|gripe|colic/.test(text)) return "Health";
  return "Other";
}

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

function ViewButton({ title, retailer, showLabel = false }: { title: string; retailer: string; showLabel?: boolean }) {
  const [resolving, setResolving] = useState(false);

  async function handleClick() {
    setResolving(true);
    try {
      const res = await fetch(`/api/item-link?title=${encodeURIComponent(title)}&retailer=${encodeURIComponent(retailer)}`);
      const data = await res.json();
      if (data.link) {
        window.open(`/go?url=${encodeURIComponent(data.link)}&retailer=${encodeURIComponent(data.retailer || retailer)}&title=${encodeURIComponent(title)}`, "_blank");
      } else {
        toast.error("Could not find product page. Try searching the retailer directly.");
      }
    } catch {
      toast.error("Could not load product link. Please try again.");
    } finally {
      setResolving(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={resolving}>
      {resolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
      {showLabel && <span className="ml-1.5">{resolving ? "Loading…" : "Best price"}</span>}
    </Button>
  );
}

export default function RegistryClient({ registry, initialItems }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState(""); // what was last actually searched
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [fromCache, setFromCache] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [myItems, setMyItems] = useState<RegistryItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState("All");
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
    setResultsVisible(true); // keep visible — no flash

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&page=1`, {
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results || []);
      setHasMore(data.hasMore || false);
      setSearchPage(1);
      setFromCache(data.cached || false);
      setCommittedQuery(q.trim());
      setResultsVisible(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // silently ignore cancelled requests
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  /** Debounce on every keystroke — skip if chip already triggered search */
  const skipDebounceRef = useRef(false);

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

    // Chip click already fired runSearch — skip the debounce this time
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    debounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, runSearch]);

  /** Trigger popular chip immediately — set flag so debounce doesn't also fire */
  function handleChipClick(chip: string) {
    skipDebounceRef.current = true;
    setSearchQuery(chip);
    inputRef.current?.focus();
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
          category: guessCategory(result.title, committedQuery),
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

  async function changeCategory(item: RegistryItem, category: string) {
    try {
      await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      setMyItems(prev => prev.map(i => i.id === item.id ? { ...i, category } : i));
    } catch { /* ignore */ }
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

        {/* Sticky header — tabs + search bar */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-3 pt-3">
          <TabsList className="mb-3">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-1.5" />
              Search products
            </TabsTrigger>
            <TabsTrigger value="list">
              <Package className="w-4 h-4 mr-1.5" />
              My list ({myItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Search input — only shown on search tab */}
          {activeTab === "search" && (
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
          )}
        </div>

        {/* ─── SEARCH TAB ─── */}
        <TabsContent value="search" className="mt-4 space-y-5">

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow flex items-center gap-1">
                        <span>🏷️</span> Best price
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm line-clamp-2 mb-2 leading-snug">{result.title}</p>
                    <div className="mb-1">
                      {result.price ? (
                        <span className="text-lg font-bold text-primary">{formatPrice(result.price)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Price unavailable</span>
                      )}
                    </div>
                    {/* Price comparison — only show if we actually have other prices for this product */}
                    <div className="mb-3">
                      {result.otherPrices && result.otherPrices.length > 0 ? (
                        <>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Also at {result.otherPrices.length} other {result.otherPrices.length === 1 ? "retailer" : "retailers"}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {result.otherPrices.map((op, idx) => (
                              <span key={idx} className="text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                                {op.retailer.split(" ")[0]} {formatPrice(op.price)}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">From {result.retailer}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(() => {
                        const alreadyAdded = myItems.some(i => i.title === result.title);
                        return (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => !alreadyAdded && addToRegistry(result)}
                            disabled={adding === result.title || alreadyAdded}
                            variant={alreadyAdded ? "secondary" : "default"}
                          >
                            {adding === result.title ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : alreadyAdded ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span className="ml-1">
                              {adding === result.title ? "Adding…" : alreadyAdded ? "In your list" : "Add to list"}
                            </span>
                          </Button>
                        );
                      })()}
                      <ViewButton title={result.title} retailer={result.retailer ?? ""} showLabel />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !searching && searchResults.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={async () => {
                  setLoadingMore(true);
                  try {
                    const nextPage = searchPage + 1;
                    const res = await fetch(`/api/search?q=${encodeURIComponent(committedQuery)}&page=${nextPage}`);
                    const data = await res.json();
                    setSearchResults(prev => [...prev, ...(data.results || [])]);
                    setHasMore(data.hasMore || false);
                    setSearchPage(nextPage);
                  } catch { /* ignore */ } finally {
                    setLoadingMore(false);
                  }
                }}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more results"}
              </button>
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
          {/* Category filter */}
          {myItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold flex-shrink-0 transition-all ${
                    activeCategory === cat.label
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  {cat.label}
                </button>
              ))}
            </div>
          )}

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {myItems.filter(item => activeCategory === "All" || item.category === activeCategory).map((item) => (
                <Card key={item.id} className={`overflow-hidden transition-all ${
                  item.isPurchased ? "opacity-60" : "hover:shadow-md"
                }`}>
                  {/* Image */}
                  <div className="relative bg-muted">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="w-full h-36 object-contain p-2" />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {item.isPurchased && (
                      <div className="absolute top-2 right-2">
                        <Badge className="text-[10px] bg-green-500 text-white px-1.5 py-0.5">Bought</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    {/* Title */}
                    <p className={`text-xs font-semibold line-clamp-2 leading-snug ${
                      item.isPurchased ? "line-through text-muted-foreground" : ""
                    }`}>{item.title}</p>
                    {/* Price + retailer + category */}
                    <div className="space-y-1">
                      {item.price && (
                        <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                      )}
                      {item.retailer && (
                        <p className="text-[10px] text-muted-foreground truncate">{item.retailer}</p>
                      )}
                      <Select value={item.category || "Other"} onValueChange={val => changeCategory(item, val)}>
                        <SelectTrigger className="h-5 text-[10px] border-0 bg-muted/60 px-1.5 py-0 rounded w-auto min-w-0 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter(c => c.label !== "All").map(c => (
                            <SelectItem key={c.label} value={c.label} className="text-xs">
                              {c.emoji} {c.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other" className="text-xs">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => toggleAlert(item)}
                          title={item.priceAlert ? "Disable alert" : "Enable price alert"}>
                          {item.priceAlert
                            ? <Bell className="w-3.5 h-3.5 text-primary" />
                            : <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => togglePurchased(item)}
                          title={item.isPurchased ? "Mark as not purchased" : "Mark as purchased"}>
                          <CheckCircle className={`w-3.5 h-3.5 ${
                            item.isPurchased ? "text-green-600" : "text-muted-foreground"
                          }`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <ViewButton title={item.title} retailer={item.retailer ?? ""} />
                    </div>
                  </CardContent>
                </Card>
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
