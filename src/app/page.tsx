import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Bump & Bundle — The Modern UK Baby Registry",
  description: "Create your perfect baby registry. Compare prices across 50+ UK retailers, share with family and friends, and get price drop alerts. Free to use.",
  keywords: "baby registry UK, baby wishlist, gift registry, baby shower list, pram comparison UK",
  openGraph: {
    title: "Bump & Bundle — The Modern UK Baby Registry",
    description: "Compare prices across 50+ UK retailers, share your registry with loved ones, and never miss a price drop.",
    url: "https://bumpandbundle.com",
    siteName: "Bump & Bundle",
    images: [{ url: "https://bumpandbundle.com/og-image.png", width: 1200, height: 630, alt: "Bump & Bundle — UK Baby Registry" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bump & Bundle — The Modern UK Baby Registry",
    description: "Compare prices across 50+ UK retailers, share your registry with loved ones, and never miss a price drop.",
    images: ["https://bumpandbundle.com/og-image.png"],
  },
  alternates: { canonical: "https://bumpandbundle.com" },
};

export default async function HomePage() {
  const latestPosts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      author: blogPosts.author,
      createdAt: blogPosts.createdAt,
      content: blogPosts.content,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt))
    .limit(3);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is Bump & Bundle free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. Create your registry, share it with family, and compare prices across UK retailers at no cost." } },
      { "@type": "Question", "name": "Which UK retailers do you cover?", "acceptedAnswer": { "@type": "Answer", "text": "We search 50+ UK retailers including Amazon, John Lewis, Argos, Boots, Mamas & Papas, Smyths, Next, Very, Tesco, ASDA and many more." } },
      { "@type": "Question", "name": "How do price drop alerts work?", "acceptedAnswer": { "@type": "Answer", "text": "Enable alerts on any item and we'll check the price regularly. When a price drops, you'll see it highlighted on your dashboard." } },
      { "@type": "Question", "name": "How do I share my registry?", "acceptedAnswer": { "@type": "Answer", "text": "Each registry gets a unique shareable link. Share via WhatsApp, email, or copy the link — no account needed for gift givers." } },
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bump & Bundle",
    "url": "https://bumpandbundle.com",
    "description": "The modern UK baby registry. Compare prices across 50+ retailers, share with loved ones, get price drop alerts.",
    "potentialAction": { "@type": "SearchAction", "target": "https://bumpandbundle.com/app/registry?q={search_term_string}", "query-input": "required name=search_term_string" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <HomePageClient latestPosts={latestPosts} />
    </>
  );
}
