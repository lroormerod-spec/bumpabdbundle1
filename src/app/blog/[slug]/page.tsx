import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowLeft, Gift } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function readingTime(content: string): number {
  return Math.ceil(content.split(/\s+/).length / 200);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.createdAt?.toISOString(),
      authors: [post.author],
      ...(post.coverImage && { images: [{ url: post.coverImage }] }),
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  if (!post) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bumpandbundle.com";
  const rt = readingTime(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    image: post.coverImage,
    publisher: {
      "@type": "Organization",
      name: "Bump & Bundle",
      url: appUrl,
    },
    url: `${appUrl}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8 shadow-md"
          />
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {rt} min read
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </span>
          <span className="text-sm text-muted-foreground">By {post.author}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary border border-border text-center">
          <div className="text-4xl mb-3">🤰</div>
          <h3 className="text-xl font-bold mb-2">Ready to build your baby registry?</h3>
          <p className="text-muted-foreground mb-6">
            Compare prices across 14 UK retailers and share with your loved ones — completely free.
          </p>
          <Button asChild size="lg">
            <Link href="/#sign-in">
              <Gift className="w-4 h-4 mr-2" />
              Create my registry
            </Link>
          </Button>
        </div>
      </article>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bump & Bundle ·{" "}
          <Link href="/" className="hover:text-foreground">Home</Link> ·{" "}
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
        </div>
      </footer>
    </div>
  );
}
