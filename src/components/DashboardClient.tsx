"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gift, CheckSquare, Heart, Baby, Camera, BookOpen,
  Clock, Bell, ArrowRight, ShoppingBag, Moon,
} from "lucide-react";
import { daysUntil, weeksPregnant } from "@/lib/utils";
import WelcomeWizard from "@/components/WelcomeWizard";

interface Props {
  user: { id: number; name: string; email: string; onboarded: boolean };
  registry: {
    id: number;
    title: string;
    dueDate: string | null;
    shareSlug: string;
  } | null;
  items: {
    id: number;
    title: string;
    isPurchased: boolean;
    priceAlert: boolean;
    price: number | null;
    lastKnownPrice: number | null;
  }[];
}

const WEEKLY_TIPS = [
  "Your baby is now the size of a lemon at 14 weeks.",
  "At 20 weeks, your baby can hear your voice! Talk and sing to them.",
  "Make sure you're taking your folic acid supplement daily.",
  "Book your antenatal classes — they fill up quickly!",
  "Start thinking about your birth plan and discuss it with your midwife.",
  "Your baby's kicks will become more regular around 28 weeks.",
  "Pack your hospital bag from around 36 weeks — just in case!",
  "Rest as much as you can in these final weeks.",
];

const QUICK_LINKS = [
  { href: "/app/registry", icon: <Gift className="w-5 h-5" />, label: "Registry", color: "bg-primary/10 text-primary" },
  { href: "/app/checklist", icon: <CheckSquare className="w-5 h-5" />, label: "Hospital Bag", color: "bg-blue-50 text-blue-600" },
  { href: "/app/names", icon: <Heart className="w-5 h-5" />, label: "Baby Names", color: "bg-rose-50 text-rose-600" },
  { href: "/app/bump-diary", icon: <Camera className="w-5 h-5" />, label: "Bump Diary", color: "bg-purple-50 text-purple-600" },
  { href: "/app/sleep-guide", icon: <Moon className="w-5 h-5" />, label: "Sleep Guide", color: "bg-indigo-50 text-indigo-600" },
  { href: "/blog", icon: <BookOpen className="w-5 h-5" />, label: "Blog", color: "bg-amber-50 text-amber-600" },
];

export default function DashboardClient({ user, registry, items }: Props) {
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (!user.onboarded) {
      setShowWizard(true);
    }
  }, [user.onboarded]);

  const days = registry?.dueDate ? daysUntil(registry.dueDate) : null;
  const weeks = registry?.dueDate ? weeksPregnant(registry.dueDate) : null;
  const totalItems = items.length;
  const purchasedItems = items.filter(i => i.isPurchased).length;
  const remainingItems = totalItems - purchasedItems;
  const progressPct = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;
  const priceAlerts = items.filter(i => i.priceAlert && i.price && i.lastKnownPrice && i.price < i.lastKnownPrice);

  const tipIndex = weeks ? Math.min(Math.floor((weeks - 4) / 4), WEEKLY_TIPS.length - 1) : 0;
  const tip = WEEKLY_TIPS[Math.max(0, tipIndex)];

  const displayName = user.name ? user.name.split(" ")[0] || user.name : user.email.split("@")[0];

  return (
    <>
      {showWizard && (
        <WelcomeWizard
          userId={user.id}
          onComplete={() => setShowWizard(false)}
        />
      )}

      <div className="space-y-8">
        {/* Welcome header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {days !== null
                ? days > 0
                  ? `${days} days until your due date`
                  : days === 0
                  ? "Your due date is today! 🎉"
                  : "Congratulations on your new arrival! 🎉"
                : "Set your due date to see your countdown"}
            </p>
          </div>
          {registry && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/registry">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                My Registry
              </Link>
            </Button>
          )}
        </div>

        {/* Price drop alert banner */}
        {priceAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">
                {priceAlerts.length} price drop{priceAlerts.length > 1 ? "s" : ""} detected!
              </p>
              <p className="text-sm text-amber-700">Items on your list have dropped in price.</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
              <Link href="/app/registry?tab=list">View</Link>
            </Button>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Items added</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{purchasedItems}</p>
                  <p className="text-sm text-muted-foreground">Gifts bought</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{remainingItems}</p>
                  <p className="text-sm text-muted-foreground">Still needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeks || "--"}</p>
                  <p className="text-sm text-muted-foreground">Weeks pregnant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress + Tip row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Registry progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Registry progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progressPct} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{purchasedItems} of {totalItems} items gifted</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              {totalItems === 0 && (
                <Button size="sm" asChild className="w-full mt-2">
                  <Link href="/app/registry">
                    Add your first item <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Weekly tip */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/40 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                🌱 Week {weeks || "?"} tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{tip}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-semibold mb-4">Quick access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:shadow-md transition-all hover:border-primary/40 bg-card text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.color}`}>
                  {link.icon}
                </div>
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
