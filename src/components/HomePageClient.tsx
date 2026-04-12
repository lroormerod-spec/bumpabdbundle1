"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import {
  Search, Share2, Bell, CheckSquare, Gift, Heart, Baby,
  ChevronRight, Star, Loader2, Check, ShoppingBag,
  ArrowRight, Clock
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string;
  createdAt: Date | null;
  content: string;
}

const UK_RETAILERS = [
  "amazon.co.uk", "johnlewis.com", "mothercare.com", "mamas-papas.com",
  "smyths.com", "argos.co.uk", "boots.com", "dunelm.com",
  "littlebird.com", "next.co.uk", "jojo.co.uk", "nuby.co.uk",
  "tesco.com", "asda.com",
];

const FAQS = [
  {
    q: "Is Bump & Bundle free to use?",
    a: "Yes, completely free. Create your registry, share it with family, and compare prices across UK retailers at no cost.",
  },
  {
    q: "Which UK retailers do you cover?",
    a: "We cover 14+ major UK retailers including Amazon, John Lewis, Mamas & Papas, Smyths, Argos, Boots, Next, and more.",
  },
  {
    q: "How do price drop alerts work?",
    a: "Enable alerts on any item and we'll check the price regularly. When a price drops, you'll see it highlighted on your dashboard.",
  },
  {
    q: "Can gift givers buy items anonymously?",
    a: "Yes. When someone purchases an item from your shared registry, they can mark it as bought so others don't duplicate gifts.",
  },
  {
    q: "How do I share my registry?",
    a: "Each registry gets a unique shareable link. Share via WhatsApp, email, or copy the link — no account needed for gift givers.",
  },
];

export default function HomePageClient({ latestPosts }: { latestPosts: Post[] }) {
  const router = useRouter();
  const [otpStep, setOtpStep] = useState<"email" | "code" | "register">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ id: number } | null>(null);
  const [regName, setRegName] = useState("");
  const [regDue, setRegDue] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOtpStep("code");
      toast.success(`Code sent to ${email}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.isNewUser) {
        setPendingUser(data.user);
        setOtpStep("register");
      } else {
        router.push("/app");
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingUser) return;
    setLoading(true);
    try {
      await fetch(`/api/users/${pendingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName.trim() }),
      });

      await fetch("/api/registries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${regName.trim()}'s Registry`,
          parentNames: regName.trim(),
          dueDate: regDue || null,
          shareSlug: Math.random().toString(36).slice(2, 10),
        }),
      });

      router.push("/app");
      router.refresh();
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  }

  function readingTime(content: string) {
    return Math.ceil(content.split(/\s+/).length / 200);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — headline */}
            <div className="space-y-6">
              <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/10">
                🇬🇧 UK&apos;s favourite baby registry
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Every baby deserves the perfect{" "}
                <span className="text-primary">welcome gift</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Create your dream baby registry in minutes. Compare prices across 14 UK
                retailers, share with loved ones, and get notified when prices drop.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Loved by 12,000+ UK families</span>
              </div>
            </div>

            {/* Right — sign-in card */}
            <div id="sign-in">
              <Card className="shadow-xl border-border">
                <CardContent className="p-8">
                  {otpStep === "email" && (
                    <form onSubmit={sendOtp} className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Get started free</h2>
                        <p className="text-sm text-muted-foreground">No password needed — we&apos;ll email you a sign-in code.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send sign-in code"}
                        {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By continuing you agree to our Terms & Privacy Policy
                      </p>
                    </form>
                  )}

                  {otpStep === "code" && (
                    <form onSubmit={verifyOtp} className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Check your email</h2>
                        <p className="text-sm text-muted-foreground">
                          We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Verification code</Label>
                        <Input
                          id="code"
                          type="text"
                          inputMode="numeric"
                          placeholder="123456"
                          value={code}
                          onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          required
                          className="h-11 text-center text-2xl tracking-[0.5em] font-bold"
                          maxLength={6}
                        />
                      </div>
                      <Button type="submit" className="w-full h-11" disabled={loading || code.length !== 6}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify code"}
                        {!loading && <Check className="w-4 h-4 ml-1" />}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setOtpStep("email")}
                        className="w-full text-sm text-muted-foreground hover:text-foreground"
                      >
                        ← Use a different email
                      </button>
                    </form>
                  )}

                  {otpStep === "register" && (
                    <form onSubmit={register} className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Welcome! Let&apos;s set up your registry 🎉</h2>
                        <p className="text-sm text-muted-foreground">Just a couple of quick details.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regName">Your name(s)</Label>
                        <Input
                          id="regName"
                          placeholder="e.g. Sarah & James"
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regDue">Due date <span className="text-muted-foreground">(optional)</span></Label>
                        <Input
                          id="regDue"
                          type="date"
                          value={regDue}
                          onChange={e => setRegDue(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <Button type="submit" className="w-full h-11" disabled={loading || !regName.trim()}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create my registry"}
                        {!loading && <Gift className="w-4 h-4 ml-1" />}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground text-lg">Get your registry ready in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Search className="w-6 h-6" />,
                title: "Search products",
                desc: "Search across 14 UK retailers at once. We compare prices and show you the best deal with a clear lowest price badge.",
              },
              {
                step: "02",
                icon: <Share2 className="w-6 h-6" />,
                title: "Share your list",
                desc: "Get a beautiful shareable link. Send it via WhatsApp, email, or copy it for your baby shower invites.",
              },
              {
                step: "03",
                icon: <Bell className="w-6 h-6" />,
                title: "Track & get alerts",
                desc: "See what's been purchased, set price drop alerts, and keep your registry up to date with ease.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center p-8 rounded-2xl bg-background border border-border hover:shadow-md transition-shadow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-sm">
                    {item.step}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 mt-2 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Tools to make your pregnancy journey a little easier</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Gift className="w-5 h-5" />, title: "Baby Registry", desc: "Add items from any UK retailer. Track what's been gifted." },
              { icon: <Bell className="w-5 h-5" />, title: "Price Alerts", desc: "Get notified when items on your list drop in price." },
              { icon: <Share2 className="w-5 h-5" />, title: "Easy Sharing", desc: "One link for everyone — WhatsApp, email, or copy & paste." },
              { icon: <CheckSquare className="w-5 h-5" />, title: "Hospital Bag", desc: "Comprehensive checklist so you never forget the essentials." },
              { icon: <Heart className="w-5 h-5" />, title: "Baby Names", desc: "Explore and save your favourite baby names together." },
              { icon: <Baby className="w-5 h-5" />, title: "Bump Diary", desc: "Document your pregnancy week by week with photos and notes." },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Retailer logos */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-10 uppercase tracking-wider">
            Compare prices across 14 UK retailers
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {UK_RETAILERS.map((retailer) => (
              <div
                key={retailer}
                className="px-4 py-2.5 rounded-full bg-background border border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all cursor-default"
              >
                {retailer}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog roll */}
      {latestPosts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">From the blog</h2>
                <p className="text-muted-foreground">Guides, tips, and advice for expecting parents</p>
              </div>
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {readingTime(post.content)} min read
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently asked questions</h2>
            <p className="text-muted-foreground">Everything you need to know about Bump & Bundle</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Baby className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Bump & Bundle</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link href="/app" className="hover:text-foreground transition-colors">Dashboard</Link>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Bump & Bundle. Made with ❤️ for UK families.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
