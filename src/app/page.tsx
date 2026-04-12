import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { db } from "@/lib/db";
import { blogPosts, pageContent } from "@/lib/schema";
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

// Default content fallbacks
const DEFAULTS: Record<string, string> = {
  hero_headline: "Every baby deserves the perfect welcome gift",
  hero_subtext: "Create your dream baby registry in minutes. Compare prices across 50+ UK retailers, share with loved ones, and get notified when prices drop.",
  hero_badge: "UK's favourite baby registry",
  social_proof: "Loved by 12,000+ UK families",
  how_it_works_subtitle: "From first search to first gift — the whole journey takes under 3 minutes.",
  faq_1_q: "Is Bump & Bundle free to use?",
  faq_1_a: "Yes, completely free. Create your registry, share it with family, and compare prices across UK retailers at no cost.",
  faq_2_q: "Which UK retailers do you cover?",
  faq_2_a: "We search 50+ UK retailers including Amazon, John Lewis, Mamas & Papas, Smyths, Argos, Boots, Next, Very, Tesco, ASDA and many more.",
  faq_3_q: "How do price drop alerts work?",
  faq_3_a: "Enable alerts on any item and we'll check the price regularly. When a price drops, you'll see it highlighted on your dashboard.",
  faq_4_q: "Can gift givers buy items anonymously?",
  faq_4_a: "Yes. When someone purchases an item from your shared registry, they can mark it as bought so others don't duplicate gifts.",
  faq_5_q: "How do I share my registry?",
  faq_5_a: "Each registry gets a unique shareable link. Share via WhatsApp, email, or copy the link — no account needed for gift givers.",
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

  // Fetch page content from DB
  const contentRows = await db.select().from(pageContent);
  const contentMap: Record<string, string> = { ...DEFAULTS };
  for (const row of contentRows) {
    contentMap[row.key] = row.value;
  }

  const faqs = [1, 2, 3, 4, 5].map(i => ({
    q: contentMap[`faq_${i}_q`] ?? "",
    a: contentMap[`faq_${i}_a`] ?? "",
  })).filter(f => f.q && f.a);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
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
      <HomePageClient
        latestPosts={latestPosts}
        heroHeadline={contentMap.hero_headline}
        heroSubtext={contentMap.hero_subtext}
        heroBadge={contentMap.hero_badge}
        socialProof={contentMap.social_proof}
        howItWorksSubtitle={contentMap.how_it_works_subtitle}
        faqs={faqs}
      />
    </>
  );
}
