"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, ShoppingBag, FileText, BarChart3, Plus, Trash2, Edit, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  users: number;
  registries: number;
  items: number;
  posts: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date | null;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  author: string;
  createdAt: Date | null;
  excerpt: string | null;
}

interface Registry {
  id: number;
  title: string;
  userId: number;
  shareSlug: string;
  dueDate: string | null;
  createdAt: Date | null;
}

interface Props {
  stats: Stats;
  users: User[];
  posts: Post[];
  registries: Registry[];
}

export default function AdminClient({ stats, users, posts: initialPosts, registries }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  async function createPost() {
    if (!newPostTitle || !newPostSlug) return;
    setSavingPost(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          slug: newPostSlug,
          content: newPostContent,
          excerpt: newPostExcerpt,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(prev => [data, ...prev]);
      setNewPostTitle("");
      setNewPostSlug("");
      setNewPostContent("");
      setNewPostExcerpt("");
      setShowNewPost(false);
      toast.success("Post created");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSavingPost(false);
    }
  }

  async function togglePostStatus(post: Post) {
    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status: newStatus }),
      });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: data.status } : p));
      toast.success(newStatus === "published" ? "Post published" : "Post unpublished");
    } catch {
      toast.error("Failed to update post");
    }
  }

  async function deletePost(postId: number) {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/admin/blog?id=${postId}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage your Bump & Bundle platform</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="blog"><FileText className="w-4 h-4 mr-1.5" />Blog</TabsTrigger>
          <TabsTrigger value="registries"><ShoppingBag className="w-4 h-4 mr-1.5" />Registries</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Users</TabsTrigger>
        </TabsList>

        {/* Overview */}
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
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
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

        {/* Blog */}
        <TabsContent value="blog" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Blog posts</h2>
            <Button onClick={() => setShowNewPost(!showNewPost)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New post
            </Button>
          </div>

          {showNewPost && (
            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold">Create new post</h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={newPostTitle}
                    onChange={e => {
                      setNewPostTitle(e.target.value);
                      if (!newPostSlug) setNewPostSlug(autoSlug(e.target.value));
                    }}
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={newPostSlug}
                    onChange={e => setNewPostSlug(e.target.value)}
                    placeholder="post-slug"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={newPostExcerpt}
                    onChange={e => setNewPostExcerpt(e.target.value)}
                    placeholder="Short description"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Content (HTML)</Label>
                  <Textarea
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="<p>Post content...</p>"
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={createPost} disabled={savingPost || !newPostTitle || !newPostSlug}>
                  {savingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save draft
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{post.title}</p>
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePostStatus(post)} title={post.status === "published" ? "Unpublish" : "Publish"}>
                    {post.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePost(post.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No posts yet</p>
            )}
          </div>
        </TabsContent>

        {/* Registries */}
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
                <p className="text-xs text-muted-foreground flex-shrink-0">
                  {registry.createdAt ? new Date(registry.createdAt).toLocaleDateString("en-GB") : ""}
                </p>
              </div>
            ))}
            {registries.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No registries yet</p>
            )}
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-6">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </span>
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
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No users yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
