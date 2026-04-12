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
import { useEffect, useRef } from "react";
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
  "amazon.co.uk", "johnlewis.com", "argos.co.uk", "boots.com",
  "mamas-papas.com", "smyths.com", "next.co.uk", "very.co.uk",
  "tesco.com", "asda.com", "littlewoods.com", "george.com",
  "dunelm.com", "mothercare.com", "kiddicare.com", "jojo.co.uk",
  "tkmaxx.com", "littlebird.com", "ebay.co.uk", "wayfair.co.uk",
  "costco.co.uk", "nuby.co.uk", "bebebebe.co.uk", "babydan.co.uk",
];

const FAQS = [
  {
    q: "Is Bump & Bundle free to use?",
    a: "Yes, completely free. Create your registry, share it with family, and compare prices across UK retailers at no cost.",
  },
  {
    q: "Which UK retailers do you cover?",
    a: "We search 50+ UK retailers including Amazon, John Lewis, Mamas & Papas, Smyths, Argos, Boots, Next, Very, Tesco, ASDA and many more — any retailer listed on Google Shopping.",
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

// ── Phone mockup screens ────────────────────────────────────────────────────

function PhoneSignIn() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 700); return () => clearInterval(t); }, []);
  const emailTyped = "emma@gmail.com";
  const typingDone = tick >= emailTyped.length;
  const sendingDone = tick >= emailTyped.length + 5;
  const phase = !typingDone ? "email" : !sendingDone ? "sending" : "code";
  const shownEmail = emailTyped.slice(0, Math.min(emailTyped.length, tick));
  const codeDigits = "482916";
  const codeStart = emailTyped.length + 5;
  const shownCode = phase === "code" ? codeDigits.slice(0, Math.min(codeDigits.length, tick - codeStart)) : "";
  return (
    <div style={{ padding: "10px 12px", fontFamily: "inherit", height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "hsl(152,28%,38%)" }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a" }}>Bump &amp; Bundle</span>
      </div>
      {phase !== "code" ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginTop: 4 }}>Get started free</div>
          <div style={{ fontSize: 9, color: "#6b7280", textAlign: "center", marginTop: -6 }}>Enter your email to sign in</div>
          <div style={{ fontSize: 8.5, fontWeight: 600, color: "#374151" }}>Email address</div>
          <div style={{ border: "1.5px solid hsl(152,28%,38%)", borderRadius: 8, padding: "6px 8px", fontSize: 9.5, color: "#1a1a1a", background: "white", minHeight: 26, display: "flex", alignItems: "center" }}>
            {shownEmail}<span style={{ borderRight: "1px solid hsl(152,28%,38%)", marginLeft: 1, animation: "blink 1s infinite" }}>&nbsp;</span>
          </div>
          <div style={{ background: phase === "sending" ? "hsl(152,28%,32%)" : typingDone ? "hsl(152,28%,38%)" : "#d1d5db", color: "white", borderRadius: 8, padding: "7px", fontSize: 10, fontWeight: 700, textAlign: "center", transition: "background 0.4s" }}>
            {phase === "sending" ? "Sending…" : "Send code →"}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginTop: 4 }}>Check your inbox</div>
          <div style={{ fontSize: 8.5, color: "#6b7280", textAlign: "center", marginTop: -6, lineHeight: 1.4 }}>Code sent to <strong style={{ color: "#374151" }}>{emailTyped}</strong></div>
          <div style={{ fontSize: 8.5, fontWeight: 600, color: "#374151" }}>Verification code</div>
          <div style={{ border: "1.5px solid hsl(152,28%,38%)", borderRadius: 8, padding: "8px", fontSize: 15, fontWeight: 700, letterSpacing: "0.4em", color: "#1a1a1a", textAlign: "center", fontFamily: "monospace", background: "white" }}>
            {shownCode || "······"}
          </div>
          <div style={{ background: shownCode.length >= 6 ? "hsl(152,28%,38%)" : "#d1d5db", color: "white", borderRadius: 8, padding: "7px", fontSize: 10, fontWeight: 700, textAlign: "center", transition: "background 0.4s" }}>
            Verify &amp; sign in →
          </div>
        </>
      )}
      <style>{"@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }"}</style>
    </div>
  );
}

function PhoneRegistry() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => (n + 1) % 120), 300); return () => clearInterval(t); }, []);
  const typed = "Graco pram";
  const shown = tick < 30 ? typed.slice(0, Math.min(typed.length, tick)) : typed;
  const showResults = tick >= 12;
  return (
    <div style={{ padding: "10px 12px", fontFamily: "inherit", height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a" }}>My Registry</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", borderRadius: 8, padding: "5px 8px" }}>
        <span style={{ fontSize: 9, color: "#9ca3af" }}>&#128269;</span>
        <span style={{ fontSize: 9, color: tick < typed.length ? "#1a1a1a" : "#9ca3af" }}>{shown || "Search products..."}</span>
      </div>
      {showResults && [
        { name: "Graco FastAction", price: "£129", badge: true, retailer: "Argos" },
        { name: "Graco Modes Travel", price: "£189", badge: false, retailer: "Amazon" },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f3f4f6", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8.5, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
            <div style={{ fontSize: 7.5, color: "#9ca3af" }}>{p.retailer}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{p.price}</div>
            {p.badge && <div style={{ fontSize: 7, background: "#ecfdf5", color: "#065f46", borderRadius: 3, padding: "1px 4px", fontWeight: 600 }}>✓ Lowest</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneShare() {
  return (
    <div style={{ padding: "10px 12px", fontFamily: "inherit", height: "100%", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", alignSelf: "flex-start" }}>Share Registry</div>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "hsl(152,28%,92%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20 }}>&#128140;</span>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a" }}>Emma &amp; James's Registry</div>
      <div style={{ fontSize: 8.5, color: "#6b7280", textAlign: "center" }}>Share with family &amp; friends</div>
      <div style={{ display: "flex", gap: 6, width: "100%" }}>
        {[{emoji:"&#128242;",label:"WhatsApp",color:"#25D366"},{emoji:"&#128140;",label:"Email",color:"hsl(152,28%,38%)"},{emoji:"&#128279;",label:"Copy",color:"#6366f1"}].map(ch => (
          <div key={ch.label} style={{ flex: 1, background: ch.color, color: "white", borderRadius: 8, padding: "6px 4px", textAlign: "center", fontSize: 8, fontWeight: 700 }}>
            <div style={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: ch.emoji }} />
            {ch.label}
          </div>
        ))}
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "6px 8px", width: "100%", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 7.5, color: "#6b7280", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>bumpandbundle.com/share/abc123</span>
        <span style={{ fontSize: 7.5, fontWeight: 700, color: "hsl(152,28%,38%)", flexShrink: 0 }}>Copy</span>
      </div>
    </div>
  );
}

const HOW_STEPS = [
  { number: "01", color: "hsl(152,28%,38%)", colorLight: "hsl(152,28%,95%)", title: "Sign in instantly", subtitle: "No passwords. No fuss.", desc: "Enter your email and we'll send a 6-digit code straight to your inbox. Verified and in within seconds — no passwords, ever.", phone: <PhoneSignIn /> },
  { number: "02", color: "hsl(217,71%,53%)", colorLight: "hsl(217,71%,96%)", title: "Search & add products", subtitle: "Live prices from 50+ UK retailers.", desc: "Search for anything — prams, monitors, feeding sets. We pull live prices from Argos, Amazon, John Lewis and more. Tap Add to list to save it.", phone: <PhoneRegistry /> },
  { number: "03", color: "hsl(25,85%,55%)", colorLight: "hsl(25,85%,96%)", title: "Share with everyone", subtitle: "One link. Zero duplicates.", desc: "Share your registry via WhatsApp, email or anywhere else. Friends and family can see what's needed and mark gifts as bought — so nobody doubles up.", phone: <PhoneShare /> },
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { const t = setInterval(() => setActive(s => (s + 1) % HOW_STEPS.length), 5500); return () => clearInterval(t); } }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const step = HOW_STEPS[active];
  return (
    <section ref={ref} className="py-24 border-y border-border" style={{ background: "hsl(28,30%,97%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4" style={{ background: "hsl(152,28%,92%)", color: "hsl(152,28%,32%)" }}>Up and running in minutes</div>
          <h2 className="text-3xl font-bold mb-3">How Bump &amp; Bundle works</h2>
          <p className="text-muted-foreground">From first search to first gift — the whole journey takes under 3 minutes.</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — step content */}
          <div className="flex-1 space-y-6">
            {/* Step tabs */}
            <div className="flex gap-2">
              {HOW_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300"
                  style={{ background: i === active ? step.color : "transparent", color: i === active ? "white" : "hsl(var(--muted-foreground))", border: `2px solid ${i === active ? step.color : "hsl(var(--border))"}` }}>
                  <span className="text-xs opacity-70">{s.number}</span>
                  {s.title}
                </button>
              ))}
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((active + 1) / HOW_STEPS.length) * 100}%`, background: step.color }} />
            </div>
            {/* Content */}
            <div key={active} style={{ animation: "fadeUp 0.4s ease" }}>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3" style={{ background: step.colorLight, color: step.color }}>
                Step {active + 1} of {HOW_STEPS.length}
              </div>
              <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
              <p className="font-semibold mb-3" style={{ color: step.color }}>{step.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
            {/* Nav buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setActive(s => Math.max(0, s - 1))} disabled={active === 0}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
                ← Back
              </button>
              <button onClick={() => setActive(s => Math.min(HOW_STEPS.length - 1, s + 1))} disabled={active === HOW_STEPS.length - 1}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-30"
                style={{ background: step.color }}>
                Next step →
              </button>
            </div>
          </div>
          {/* Right — phone mockup */}
          <div className="flex-shrink-0">
            <div style={{ width: 240, height: 480, borderRadius: 36, background: "#1a1a2e", padding: "12px 8px", boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
              {/* Notch */}
              <div style={{ width: 60, height: 20, borderRadius: "0 0 12px 12px", background: "#1a1a2e", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333" }} />
              </div>
              {/* Screen */}
              <div style={{ background: "#f9f5f0", borderRadius: 24, height: "calc(100% - 36px)", overflow: "hidden", transition: "all 0.4s ease" }}>
                <div key={active} style={{ height: "100%", animation: "fadeIn 0.4s ease" }}>
                  {step.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </section>
  );
}

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
      toast.success(`Code sent to ${email} — check your inbox`);
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
                Create your dream baby registry in minutes. Compare prices across 50+ UK
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

      <HowItWorks />

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
            Compare prices across 50+ UK retailers
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
