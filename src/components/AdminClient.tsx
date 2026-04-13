"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, ShoppingBag, FileText, BarChart3, Plus, Trash2, Edit, Eye, EyeOff,
  Loader2, X, Download, Search, MousePointerClick, Pencil, Check, Copy, FileEdit, ChevronRight, ArrowLeft,
  Mail, Send, RefreshCw, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import RichEditor from "@/components/RichEditor";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Stats {
  users: number;
  registries: number;
  items: number;
  posts: number;
}

interface EnrichedUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  onboarded: boolean;
  createdAt: Date | null;
  registryCount: number;
  itemCount: number;
  dueDate: string | null;
  lastActive: Date | null;
  segment: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  author: string;
  createdAt: Date | null;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
}

interface Registry {
  id: number;
  title: string;
  userId: number;
  shareSlug: string;
  dueDate: string | null;
  createdAt: Date | null;
}

interface AffiliateClick {
  id: number;
  retailer: string | null;
  productTitle: string | null;
  originalUrl: string | null;
  finalUrl: string | null;
  userId: number | null;
  createdAt: Date | null;
}

interface PageContentItem {
  id: number;
  key: string;
  value: string;
  updatedAt: Date | null;
}

interface Props {
  stats: Stats;
  users: EnrichedUser[];
  posts: Post[];
  registries: Registry[];
  affiliateClicks: AffiliateClick[];
  pageContent: PageContentItem[];
}

// ─── Segment helpers ────────────────────────────────────────────────────────

const SEGMENT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:            { label: "Active",            color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  registered:        { label: "Registered",        color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  dormant:           { label: "Dormant",           color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-400" },
  due_soon:          { label: "Due soon",          color: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500" },
  registry_complete: { label: "Registry complete", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

function SegmentBadge({ segment }: { segment: string }) {
  const cfg = SEGMENT_CONFIG[segment] ?? { label: segment, color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function relativeTime(date: Date | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-GB");
}

// ─── Page field label map ────────────────────────────────────────────────────

const PAGE_FIELD_LABELS: Record<string, string> = {
  hero_headline: "Hero Headline",
  hero_subtext: "Hero Subtext",
  hero_badge: "Hero Badge",
  social_proof: "Social Proof Text",
  how_it_works_subtitle: "How It Works Subtitle",
  faq_1_q: "FAQ 1 — Question",
  faq_1_a: "FAQ 1 — Answer",
  faq_2_q: "FAQ 2 — Question",
  faq_2_a: "FAQ 2 — Answer",
  faq_3_q: "FAQ 3 — Question",
  faq_3_a: "FAQ 3 — Answer",
  faq_4_q: "FAQ 4 — Question",
  faq_4_a: "FAQ 4 — Answer",
  faq_5_q: "FAQ 5 — Question",
  faq_5_a: "FAQ 5 — Answer",
};

// ─── Main component ──────────────────────────────────────────────────────────

function LinkHealthPanel() {
  const [data, setData] = useState<{ failures: any[]; cached: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [prewarming, setPrewarming] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/link-health");
      setData(await res.json());
    } finally { setLoading(false); }
  }

  async function prewarm() {
    setPrewarming(true);
    try {
      const res = await fetch("/api/admin/prewarm", { method: "POST" });
      const d = await res.json();
      toast.success(`Pre-warmed ${d.warmed} searches (${d.skipped} already fresh)`);
    } finally { setPrewarming(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Link Health</h2>
          <p className="text-sm text-muted-foreground">Monitor affiliate link resolution and search cache</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prewarm} disabled={prewarming}>
            {prewarming && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            Pre-warm searches
          </Button>
          <Button onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Load stats
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-2xl font-bold text-primary">{data.cached}</p>
              <p className="text-sm text-muted-foreground">Cached links</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-2xl font-bold text-destructive">{data.total}</p>
              <p className="text-sm text-muted-foreground">Failed resolutions</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-2xl font-bold">
                {data.total === 0 ? "100" : Math.round((1 - data.total / Math.max(data.cached + data.total, 1)) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Resolution rate</p>
            </div>
          </div>

          {data.failures.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Recent failures</h3>
              {data.failures.map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.product_title || "Unknown product"}</p>
                    <p className="text-xs text-muted-foreground">{f.retailer} · {new Date(f.created_at).toLocaleString("en-GB")}</p>
                  </div>
                  <span className="text-xs text-destructive font-medium flex-shrink-0">{f.reason}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!data && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <p>Click "Load stats" to see link health data</p>
        </div>
      )}
    </div>
  );
}

export default function AdminClient({ stats, users, posts: initialPosts, registries, affiliateClicks, pageContent: initialPageContent }: Props) {
  // Blog state
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  // CRM state
  const [crmSearch, setCrmSearch] = useState("");
  const [crmSegment, setCrmSegment] = useState("all");
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function deleteUser(userId: number) {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      // Remove from local state
      (users as EnrichedUser[]).splice(users.findIndex(u => u.id === userId), 1);
      setSelectedUser(null);
      toast.success("User deleted");
      window.location.reload();
    } catch {
      toast.error("Failed to delete user");
    }
  }

  async function createInvite() {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInviteLink(data.magicUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Page content state
  const [pageContentItems, setPageContentItems] = useState(initialPageContent);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingContent, setSavingContent] = useState(false);

  // ── Blog handlers ──────────────────────────────────────────────────────────

  async function saveEditedPost() {
    if (!editingPost) return;
    setSavingPost(true);
    try {
      const res = await fetch(`/api/admin/blog`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPost.id, title: editingPost.title, slug: editingPost.slug, content: editingPost.content, excerpt: editingPost.excerpt }),
      });
      const updated = await res.json();
      setPosts(posts.map(p => p.id === updated.id ? updated : p));
      setEditingPost(null);
      toast.success("Post saved");
    } finally { setSavingPost(false); }
  }

  async function createPost() {
    if (!newPostTitle || !newPostSlug) return;
    setSavingPost(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPostTitle, slug: newPostSlug, content: newPostContent, excerpt: newPostExcerpt, status: "draft" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(prev => [data, ...prev]);
      setNewPostTitle(""); setNewPostSlug(""); setNewPostContent(""); setNewPostExcerpt("");
      setShowNewPost(false);
      toast.success("Post created");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally { setSavingPost(false); }
  }

  async function togglePostStatus(post: Post) {
    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      const res = await fetch("/api/admin/blog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, status: newStatus }) });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: data.status } : p));
      toast.success(newStatus === "published" ? "Post published" : "Post unpublished");
    } catch { toast.error("Failed to update post"); }
  }

  async function deletePost(postId: number) {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/admin/blog?id=${postId}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete post"); }
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // ── Page content handlers ──────────────────────────────────────────────────

  function startEditContent(item: PageContentItem) {
    setEditingKey(item.key);
    setEditingValue(item.value);
  }

  async function saveContent(key: string) {
    setSavingContent(true);
    try {
      const res = await fetch("/api/admin/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editingValue }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPageContentItems(prev => prev.map(p => p.key === key ? { ...p, value: editingValue } : p));
      setEditingKey(null);
      toast.success("Saved — homepage updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setSavingContent(false); }
  }

  // ── CRM filtering ──────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u => {
    const matchSegment = crmSegment === "all" || u.segment === crmSegment;
    const matchSearch = !crmSearch || u.name.toLowerCase().includes(crmSearch.toLowerCase()) || u.email.toLowerCase().includes(crmSearch.toLowerCase());
    return matchSegment && matchSearch;
  });

  const segmentCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.segment] = (acc[u.segment] ?? 0) + 1;
    return acc;
  }, {});

  // ── Affiliate click aggregation ────────────────────────────────────────────

  const byRetailer = affiliateClicks.reduce<Record<string, number>>((acc, c) => {
    const key = c.retailer ?? "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const sortedRetailers = Object.entries(byRetailer).sort((a, b) => b[1] - a[1]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage your Bump &amp; Bundle platform</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="crm"><Users className="w-4 h-4 mr-1.5" />CRM</TabsTrigger>
          <TabsTrigger value="blog"><FileText className="w-4 h-4 mr-1.5" />Blog</TabsTrigger>
          <TabsTrigger value="registries"><ShoppingBag className="w-4 h-4 mr-1.5" />Registries</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="affiliate"><MousePointerClick className="w-4 h-4 mr-1.5" />Affiliate Clicks</TabsTrigger>
          <TabsTrigger value="link-health"><ChevronRight className="w-4 h-4 mr-1.5" />Link Health</TabsTrigger>
          <TabsTrigger value="pages"><FileEdit className="w-4 h-4 mr-1.5" />Pages</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1.5" />Email</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total users", value: stats.users, icon: <Users className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
              { label: "Registries", value: stats.registries, icon: <ShoppingBag className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
              { label: "Registry items", value: stats.items, icon: <ShoppingBag className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
              { label: "Blog posts", value: stats.posts, icon: <FileText className="w-5 h-5" />, color: "bg-amber-50 text-amber-600" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── CRM ──────────────────────────────────────────────────────────── */}
        <TabsContent value="crm" className="mt-6 space-y-6">
          {selectedUser ? (
            // User profile panel
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}><ArrowLeft className="w-4 h-4" /></Button>
                <div>
                  <h2 className="font-semibold text-lg">{selectedUser.name || "(no name)"}</h2>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <SegmentBadge segment={selectedUser.segment} />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Joined", value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-GB") : "—" },
                  { label: "Registries", value: selectedUser.registryCount },
                  { label: "Items added", value: selectedUser.itemCount },
                  { label: "Last active", value: relativeTime(selectedUser.lastActive) },
                ].map(s => (
                  <Card key={s.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className="font-semibold">{s.value}</p></CardContent></Card>
                ))}
              </div>

              {selectedUser.dueDate && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                  Due date: <strong>{new Date(selectedUser.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Segment tiles */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.entries(SEGMENT_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => { setCrmSegment(crmSegment === key ? "all" : key); setSelectedUser(null); }}
                    className={`p-3 rounded-xl border text-left transition-all ${crmSegment === key ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                      <span className="text-sm font-semibold">{segmentCounts[key] ?? 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  </button>
                ))}
              </div>

              {/* Search + export */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={crmSearch}
                    onChange={e => { setCrmSearch(e.target.value); setSelectedUser(null); }}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" asChild>
                  <a href="/api/admin/export" download>
                    <Download className="w-4 h-4 mr-1.5" />Export CSV
                  </a>
                </Button>
                <Button onClick={() => { setShowInvite(!showInvite); setInviteLink(null); setInviteEmail(""); setInviteName(""); }}>
                  <Plus className="w-4 h-4 mr-1.5" />Invite user
                </Button>
                {crmSegment !== "all" && (
                  <Button variant="ghost" size="sm" onClick={() => setCrmSegment("all")}>
                    <X className="w-3.5 h-3.5 mr-1" />Clear filter
                  </Button>
                )}
              </div>

              {/* Invite panel */}
              {showInvite && (
                <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-4">
                  <h3 className="font-semibold">Invite a user</h3>
                  {!inviteLink ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Name (optional)</Label>
                        <Input placeholder="e.g. Sarah Jones" value={inviteName} onChange={e => setInviteName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email address</Label>
                        <Input type="email" placeholder="sarah@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <Button onClick={createInvite} disabled={inviteLoading || !inviteEmail}>
                          {inviteLoading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                          Generate invite link
                        </Button>
                        <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Share this link with <strong>{inviteEmail}</strong> — it logs them straight in, no email needed. Valid for 7 days, one use only.</p>
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                        <code className="text-xs flex-1 truncate text-muted-foreground">{inviteLink}</code>
                        <Button size="sm" variant="outline" onClick={copyLink}>
                          {copied ? <><Check className="w-3.5 h-3.5 mr-1" />Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copy</>}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setInviteLink(null); setInviteEmail(""); setInviteName(""); }}>Generate another</Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)}>Done</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Due date</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Last active</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Segment</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-xs">
                                  {(user.name || user.email)[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium truncate max-w-[120px]">{user.name || "(no name)"}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground hidden sm:table-cell truncate max-w-[160px]">{user.email}</td>
                          <td className="p-3 hidden md:table-cell">{user.itemCount}</td>
                          <td className="p-3 text-muted-foreground hidden lg:table-cell">
                            {user.dueDate ? new Date(user.dueDate).toLocaleDateString("en-GB") : "—"}
                          </td>
                          <td className="p-3 text-muted-foreground hidden lg:table-cell">{relativeTime(user.lastActive)}</td>
                          <td className="p-3"><SegmentBadge segment={user.segment} /></td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteUser(user.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedUser(user)}>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">No users match this filter</p>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Blog ─────────────────────────────────────────────────────────── */}
        <TabsContent value="blog" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Blog posts</h2>
            <Button onClick={() => setShowNewPost(!showNewPost)}><Plus className="w-4 h-4 mr-1.5" />New post</Button>
          </div>

          {showNewPost && (
            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold">Create new post</h3>
              <div className="grid gap-4">
                <div className="space-y-1.5"><Label>Title</Label><Input value={newPostTitle} onChange={e => { setNewPostTitle(e.target.value); if (!newPostSlug) setNewPostSlug(autoSlug(e.target.value)); }} placeholder="Post title" /></div>
                <div className="space-y-1.5"><Label>Slug</Label><Input value={newPostSlug} onChange={e => setNewPostSlug(e.target.value)} placeholder="post-slug" /></div>
                <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={newPostExcerpt} onChange={e => setNewPostExcerpt(e.target.value)} placeholder="Short description" rows={2} /></div>
                <div className="space-y-1.5"><Label>Content</Label><RichEditor content={newPostContent} onChange={setNewPostContent} placeholder="Start writing your post..." /></div>
              </div>
              <div className="flex gap-3">
                <Button onClick={createPost} disabled={savingPost || !newPostTitle || !newPostSlug}>
                  {savingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Save draft
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {editingPost && (
            <div className="border border-primary/30 rounded-xl p-6 bg-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Editing: {editingPost.title}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingPost(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid gap-4">
                <div className="space-y-1.5"><Label>Title</Label><Input value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Slug</Label><Input value={editingPost.slug} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={editingPost.excerpt || ""} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} rows={2} /></div>
                <div className="space-y-1.5"><Label>Content</Label><RichEditor content={editingPost.content || ""} onChange={html => setEditingPost({ ...editingPost, content: html })} /></div>
              </div>
              <div className="flex gap-3">
                <Button onClick={saveEditedPost} disabled={savingPost}>
                  {savingPost ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}Save changes
                </Button>
                <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors ${editingPost?.id === post.id ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{post.title}</p>
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs flex-shrink-0">{post.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingPost(post)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePostStatus(post)}>
                    {post.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePost(post.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-center text-muted-foreground py-10">No posts yet</p>}
          </div>
        </TabsContent>

        {/* ── Registries ───────────────────────────────────────────────────── */}
        <TabsContent value="registries" className="mt-6">
          <div className="space-y-3">
            {registries.map((registry) => (
              <div key={registry.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{registry.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    User ID: {registry.userId} · Slug: {registry.shareSlug}
                    {registry.dueDate && ` · Due: ${new Date(registry.dueDate).toLocaleDateString("en-GB")}`}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground flex-shrink-0 mr-2">
                  {registry.createdAt ? new Date(registry.createdAt).toLocaleDateString("en-GB") : ""}
                </p>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={async () => {
                    if (!confirm("Delete this registry and all its items?")) return;
                    await fetch(`/api/admin/registries?id=${registry.id}`, { method: "DELETE" });
                    toast.success("Registry deleted");
                    window.location.reload();
                  }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            {registries.length === 0 && <p className="text-center text-muted-foreground py-10">No registries yet</p>}
          </div>
        </TabsContent>

        {/* ── Users (simple list) ───────────────────────────────────────────── */}
        <TabsContent value="users" className="mt-6">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.name || "(no name)"}</p>
                    {user.isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <p className="text-xs text-muted-foreground flex-shrink-0">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : ""}
                </p>
              </div>
            ))}
            {users.length === 0 && <p className="text-center text-muted-foreground py-10">No users yet</p>}
          </div>
        </TabsContent>

        {/* ── Affiliate Clicks ──────────────────────────────────────────────── */}
        <TabsContent value="affiliate" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Affiliate Clicks</h2>
            <div className="text-sm text-muted-foreground">Total clicks: {affiliateClicks.length}</div>
          </div>

          {/* Revenue potential estimate */}
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Potential</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-primary">{affiliateClicks.length}</p>
                  <p className="text-xs text-muted-foreground">Total clicks</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-primary">{Math.round(affiliateClicks.length * 0.04)}</p>
                  <p className="text-xs text-muted-foreground">Est. conversions (4%)</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-primary">£{(affiliateClicks.length * 0.04 * 8.5).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Est. revenue (avg £8.50/sale)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By retailer */}
          {sortedRetailers.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Clicks by retailer</h3>
              <div className="space-y-2">
                {sortedRetailers.map(([retailer, count]) => (
                  <div key={retailer} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{retailer}</span>
                    </div>
                    <Badge variant="secondary">{count} clicks</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent clicks */}
          <div>
            <h3 className="font-medium mb-3">Recent clicks</h3>
            <div className="space-y-2">
              {affiliateClicks.slice(0, 50).map(click => (
                <div key={click.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{click.productTitle || "Unknown product"}</p>
                    <p className="text-xs text-muted-foreground">{click.retailer ?? "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {click.createdAt ? relativeTime(new Date(click.createdAt)) : "—"}
                  </p>
                </div>
              ))}
              {affiliateClicks.length === 0 && <p className="text-center text-muted-foreground py-8">No clicks yet</p>}
            </div>
          </div>
        </TabsContent>

        {/* ── Pages ────────────────────────────────────────────────────────── */}
        {/* ── Link Health ───────────────────────────────────────────────── */}
        <TabsContent value="link-health" className="mt-6 space-y-6">
          <LinkHealthPanel />
        </TabsContent>

        <TabsContent value="pages" className="mt-6 space-y-6">
          <div>
            <h2 className="font-semibold text-lg">Page Editor</h2>
            <p className="text-sm text-muted-foreground">Edit homepage content. Changes take effect immediately.</p>
          </div>

          <div className="space-y-3">
            {pageContentItems.map(item => (
              <div key={item.key} className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="px-5 py-3 flex items-center justify-between bg-muted/30 border-b border-border">
                  <div>
                    <p className="font-medium text-sm">{PAGE_FIELD_LABELS[item.key] ?? item.key}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.key}</p>
                  </div>
                  {editingKey !== item.key ? (
                    <Button variant="ghost" size="sm" onClick={() => startEditContent(item)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveContent(item.key)} disabled={savingContent}>
                        {savingContent ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingKey(null)}>Cancel</Button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {editingKey === item.key ? (
                    item.value.length > 100 ? (
                      <Textarea
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        rows={4}
                        className="text-sm"
                        autoFocus
                      />
                    ) : (
                      <Input
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            {pageContentItems.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No page content found</p>
            )}
          </div>
        </TabsContent>

        {/* ── Email ─────────────────────────────────────────────────────────── */}
        <TabsContent value="email" className="mt-6 space-y-8">
          <EmailAdminTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}

// ─── Email Admin Tab (self-contained) ────────────────────────────────────────

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  html: string;
  updatedAt: Date | null;
}

interface EmailLogEntry {
  id: number;
  toEmail: string;
  subject: string;
  templateKey: string | null;
  status: string;
  resendId: string | null;
  error: string | null;
  sentAt: Date | null;
}

function EmailAdminTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  async function loadTemplates() {
    setLoadingTemplates(true);
    const res = await fetch("/api/admin/email-templates");
    const data = await res.json();
    setTemplates(data);
    setLoadingTemplates(false);
  }

  async function loadLogs() {
    setLoadingLogs(true);
    const res = await fetch("/api/admin/email-log");
    const data = await res.json();
    setLogs(data);
    setLoadingLogs(false);
  }

  useEffect(() => {
    loadTemplates();
    loadLogs();
  }, []);

  async function saveTemplate() {
    if (!editingTemplate) return;
    setSaving(true);
    await fetch("/api/admin/email-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTemplate),
    });
    setSaving(false);
    toast.success("Template saved");
    setTemplates(prev => prev.map(t => t.key === editingTemplate.key ? { ...editingTemplate } : t));
    setEditingTemplate(null);
  }

  async function sendTest(key: string) {
    if (!testEmail.trim()) { toast.error("Enter a test email address first"); return; }
    setTestingKey(key);
    const res = await fetch("/api/admin/email-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testEmail.trim(), templateKey: key }),
    });
    const data = await res.json();
    setTestingKey(null);
    if (res.ok) {
      toast.success(`Test email sent to ${testEmail}`);
      loadLogs();
    } else {
      toast.error(data.error || "Failed to send test");
    }
  }

  function statusBadge(status: string) {
    if (status === "sent") return <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"><CheckCircle className="w-3 h-3" />Sent</span>;
    if (status === "sent_fallback") return <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><AlertCircle className="w-3 h-3" />Fallback</span>;
    return <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"><XCircle className="w-3 h-3" />Failed</span>;
  }

  if (editingTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="font-semibold">Editing: {editingTemplate.name}</h2>
        </div>

        <div className="grid gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Template name</Label>
            <Input value={editingTemplate.name} onChange={e => setEditingTemplate(t => t ? { ...t, name: e.target.value } : t)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Subject line</Label>
            <Input value={editingTemplate.subject} onChange={e => setEditingTemplate(t => t ? { ...t, subject: e.target.value } : t)} />
            <p className="text-xs text-muted-foreground mt-1">Available variables: <code>&#123;&#123;code&#125;&#125;</code> <code>&#123;&#123;name&#125;&#125;</code> <code>&#123;&#123;magic_link&#125;&#125;</code></p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">HTML body</Label>
            <Textarea
              value={editingTemplate.html}
              onChange={e => setEditingTemplate(t => t ? { ...t, html: e.target.value } : t)}
              rows={20}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Use <code>&#123;&#123;code&#125;&#125;</code>, <code>&#123;&#123;name&#125;&#125;</code>, <code>&#123;&#123;magic_link&#125;&#125;</code> as placeholders.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPreviewHtml(editingTemplate.html)} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1.5" /> Preview
            </Button>
            <Button onClick={saveTemplate} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-1.5" />Save template</>}
            </Button>
          </div>
        </div>

        {/* Inline preview */}
        {previewHtml && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium">Preview</span>
              <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(null)}><X className="w-4 h-4" /></Button>
            </div>
            <iframe srcDoc={previewHtml} className="w-full h-96" sandbox="allow-same-origin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Test send bar */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Test email address"
          value={testEmail}
          onChange={e => setTestEmail(e.target.value)}
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">Enter an address, then click Send test on any template below.</p>
      </div>

      {/* Templates */}
      <div>
        <h2 className="font-semibold mb-4">Email templates</h2>
        {loadingTemplates ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.key} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{t.name}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">{t.key}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                  {t.updatedAt && <p className="text-xs text-muted-foreground mt-0.5">Last updated: {new Date(t.updatedAt).toLocaleDateString("en-GB")}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => sendTest(t.key)}
                    disabled={testingKey === t.key}
                  >
                    {testingKey === t.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span className="ml-1.5">Send test</span>
                  </Button>
                  <Button size="sm" onClick={() => setEditingTemplate({ ...t })}>
                    <Edit className="w-3.5 h-3.5 mr-1.5" />Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Send log <span className="text-muted-foreground font-normal text-sm">(last 100)</span></h2>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loadingLogs}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingLogs ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
        {loadingLogs ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No emails sent yet.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-xs font-mono">{log.toEmail}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">{log.subject}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.templateKey ?? "—"}</td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
