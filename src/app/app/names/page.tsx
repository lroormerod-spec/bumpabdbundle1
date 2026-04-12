"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, HeartOff, Search, RefreshCw } from "lucide-react";

interface BabyName {
  name: string;
  meaning: string;
  origin: string;
  gender: "boy" | "girl" | "neutral";
}

const NAMES: BabyName[] = [
  { name: "Olivia", meaning: "Olive tree", origin: "Latin", gender: "girl" },
  { name: "Noah", meaning: "Rest, comfort", origin: "Hebrew", gender: "boy" },
  { name: "Amelia", meaning: "Industrious", origin: "Latin", gender: "girl" },
  { name: "Oliver", meaning: "Olive tree", origin: "Latin", gender: "boy" },
  { name: "Isla", meaning: "Island", origin: "Scottish", gender: "girl" },
  { name: "George", meaning: "Farmer", origin: "Greek", gender: "boy" },
  { name: "Sophia", meaning: "Wisdom", origin: "Greek", gender: "girl" },
  { name: "Arthur", meaning: "Bear", origin: "Celtic", gender: "boy" },
  { name: "Freya", meaning: "Noble woman", origin: "Norse", gender: "girl" },
  { name: "Harry", meaning: "Home ruler", origin: "Germanic", gender: "boy" },
  { name: "Lily", meaning: "Purity, beauty", origin: "English", gender: "girl" },
  { name: "Jack", meaning: "God is gracious", origin: "English", gender: "boy" },
  { name: "Poppy", meaning: "Red flower", origin: "English", gender: "girl" },
  { name: "Charlie", meaning: "Free man", origin: "Germanic", gender: "neutral" },
  { name: "Grace", meaning: "God's favour", origin: "Latin", gender: "girl" },
  { name: "Theo", meaning: "Divine gift", origin: "Greek", gender: "boy" },
  { name: "Ava", meaning: "Life, bird-like", origin: "Latin", gender: "girl" },
  { name: "Henry", meaning: "Home ruler", origin: "Germanic", gender: "boy" },
  { name: "Ella", meaning: "Beautiful, fairy maiden", origin: "Germanic", gender: "girl" },
  { name: "James", meaning: "Supplanter", origin: "Hebrew", gender: "boy" },
  { name: "Mia", meaning: "Mine, beloved", origin: "Scandinavian", gender: "girl" },
  { name: "William", meaning: "Resolute protector", origin: "Germanic", gender: "boy" },
  { name: "Rosie", meaning: "Rose flower", origin: "English", gender: "girl" },
  { name: "Luca", meaning: "Light", origin: "Italian", gender: "neutral" },
  { name: "Florence", meaning: "Blooming, flourishing", origin: "Latin", gender: "girl" },
  { name: "Sebastian", meaning: "Venerable", origin: "Greek", gender: "boy" },
  { name: "Luna", meaning: "Moon", origin: "Latin", gender: "girl" },
  { name: "Ethan", meaning: "Strong, enduring", origin: "Hebrew", gender: "boy" },
  { name: "Evie", meaning: "Life", origin: "Hebrew", gender: "girl" },
  { name: "Leo", meaning: "Lion", origin: "Latin", gender: "boy" },
];

export default function NamesPage() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "boy" | "girl" | "neutral">("all");

  function toggleLike(name: string) {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const filtered = NAMES.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === "all" || n.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const likedNames = NAMES.filter(n => liked.has(n.name));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Baby name explorer</h1>
        <p className="text-muted-foreground">Browse popular UK baby names and save your favourites</p>
      </div>

      <Tabs defaultValue="explore">
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="favourites">
            Favourites ({liked.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search names or meanings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "girl", "boy", "neutral"] as const).map(g => (
                <Button
                  key={g}
                  variant={genderFilter === g ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenderFilter(g)}
                  className="capitalize"
                >
                  {g === "all" ? "All" : g === "neutral" ? "Neutral" : g === "girl" ? "Girl" : "Boy"}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{filtered.length} names</p>

          <div className="grid gap-3">
            {filtered.map((name) => (
              <div
                key={name.name}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{name.name}</h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${
                        name.gender === "girl" ? "bg-pink-50 text-pink-700" :
                        name.gender === "boy" ? "bg-blue-50 text-blue-700" :
                        "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {name.gender}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {name.meaning} · <span className="italic">{name.origin}</span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLike(name.name)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  {liked.has(name.name) ? (
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  ) : (
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favourites" className="mt-6">
          {likedNames.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 text-rose-200" />
              <p className="text-lg font-medium mb-1">No favourites yet</p>
              <p className="text-sm">Tap the heart on any name to save it</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {likedNames.map((name) => (
                <div
                  key={name.name}
                  className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{name.name}</h3>
                      <Badge variant="secondary" className="text-xs capitalize bg-rose-100 text-rose-700">
                        {name.gender}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{name.meaning}</p>
                  </div>
                  <button onClick={() => toggleLike(name.name)} className="p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
