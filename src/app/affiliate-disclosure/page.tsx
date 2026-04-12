import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Bump & Bundle",
  description: "How Bump & Bundle earns commission through affiliate links.",
  robots: { index: true, follow: true },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Bump <span className="text-primary">&</span> Bundle</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold mb-2">Affiliate Disclosure</h1>
          <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
            <p className="text-foreground font-medium">In plain English: some links on Bump &amp; Bundle earn us a small commission if you buy something. It never costs you more — in fact, we always show you the best available price. This commission is what keeps the service free for everyone.</p>
          </div>

          <Section title="How it works">
            <p>Bump &amp; Bundle is a free service for expectant parents. To keep it free, we participate in affiliate programmes with UK retailers. When you click a &ldquo;Best price&rdquo; or &ldquo;View&rdquo; link on our site and subsequently make a purchase, we may earn a small commission from the retailer.</p>
            <p>This commission comes from the retailer&apos;s marketing budget — it does not increase the price you pay. You always pay the same price as going directly to the retailer.</p>
          </Section>

          <Section title="Our commitment to you">
            <ul>
              <li><strong>We always show the best available price.</strong> Our &ldquo;Lowest price&rdquo; badge highlights the cheapest option we find across all retailers — regardless of which one pays us the most commission.</li>
              <li><strong>We never artificially promote products.</strong> Search results are ordered by relevance and price, not by affiliate commission rate.</li>
              <li><strong>Affiliate relationships never influence our editorial content.</strong> Blog posts and buying guides are written to help you make the best decision for your family.</li>
              <li><strong>We are transparent.</strong> Any link that may earn us a commission is an affiliate link. You will always be redirected to the retailer&apos;s own website to complete your purchase.</li>
            </ul>
          </Section>

          <Section title="Which retailers we work with">
            <p>We work with affiliate programmes covering major UK baby and nursery retailers including but not limited to: Amazon, John Lewis, Argos, Boots, Mamas &amp; Papas, Smyths Toys, Next, Very, ASDA George, Tesco, Dunelm and others.</p>
            <p>These relationships are managed through affiliate networks including AWIN and others. All programmes comply with UK ASA (Advertising Standards Authority) guidelines.</p>
          </Section>

          <Section title="UK advertising standards compliance">
            <p>We comply with the UK CAP Code and ASA guidelines on affiliate marketing disclosure. Where content is substantially influenced by an affiliate relationship, we clearly label it.</p>
            <p>This disclosure is made in accordance with the Competition and Markets Authority (CMA) guidelines on online reviews and endorsements.</p>
          </Section>

          <Section title="Your purchase is your choice">
            <p>You are under no obligation to purchase anything through our links. You can always go directly to a retailer&apos;s website. Our goal is simply to help you find the best products at the best prices for your growing family.</p>
          </Section>

          <Section title="Questions">
            <p>If you have any questions about our affiliate relationships, please contact us at <a href="mailto:hello@bumpandbundle.com" className="text-primary">hello@bumpandbundle.com</a>.</p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link>
        <Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link>
        <Link href="/affiliate-disclosure" className="hover:text-foreground">Affiliate Disclosure</Link>
      </div>
    </footer>
  );
}
