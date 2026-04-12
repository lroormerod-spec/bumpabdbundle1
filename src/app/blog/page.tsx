import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Pregnancy & Baby Advice",
  description:
    "Expert advice, guides, and tips for expecting and new parents in the UK.",
};

function readingTime(content: string): number {
  return Math.ceil(content.split(/\s+/).length / 200);
}

export default async function BlogPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">The Bump & Bundle Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Expert guides, practical tips, and heartfelt advice for every step of your pregnancy and parenting journey.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="h-full rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 bg-card">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <span className="text-5xl">🤰</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime(post.content)} min read
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <h2 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{post.author[0]}</span>
                      </div>
                      {post.author}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bump & Bundle ·{" "}
          <Link href="/" className="hover:text-foreground">Home</Link>
        </div>
      </footer>
    </div>
  );
}
