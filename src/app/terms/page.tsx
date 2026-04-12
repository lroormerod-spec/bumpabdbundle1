import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Bump & Bundle",
  description: "Terms and conditions for using Bump & Bundle.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

          <Section title="1. About Bump & Bundle">
            <p>These terms govern your use of bumpandbundle.com (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these terms. If you do not agree, please do not use the Service.</p>
            <p>Bump &amp; Bundle is a free baby gift registry platform that allows expectant parents to search and compare products across UK retailers and share their wishlist with friends and family.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to create an account. By using the Service, you confirm that you meet this requirement.</p>
          </Section>

          <Section title="3. Your account">
            <ul>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate information when signing up</li>
              <li>You must notify us immediately if you suspect unauthorised access to your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Upload or share content that is offensive, harmful, or infringes third-party rights</li>
              <li>Use automated tools to scrape or extract data from the Service</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </Section>

          <Section title="5. Product information and prices">
            <p>Product listings, prices, and availability on Bump &amp; Bundle are sourced from third-party retailers via search APIs. We do not sell products directly.</p>
            <ul>
              <li>Prices shown are indicative and may not reflect the exact price at checkout</li>
              <li>Product availability can change without notice</li>
              <li>We are not responsible for any errors in product information provided by retailers</li>
              <li>Always verify prices and availability on the retailer&apos;s website before purchasing</li>
            </ul>
          </Section>

          <Section title="6. Affiliate links">
            <p>Some links on Bump &amp; Bundle are affiliate links. When you click through and make a purchase, we may receive a commission from the retailer. This does not affect the price you pay. See our <Link href="/affiliate-disclosure" className="text-primary">Affiliate Disclosure</Link> for details.</p>
          </Section>

          <Section title="7. Intellectual property">
            <p>All content on Bump &amp; Bundle, including text, graphics, logos, and software, is owned by or licensed to us. You may not reproduce, distribute, or create derivative works without our written permission.</p>
            <p>Content you create (such as registry names and notes) remains yours. By submitting it, you grant us a licence to store and display it as part of the Service.</p>
          </Section>

          <Section title="8. Disclaimers">
            <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee:</p>
            <ul>
              <li>That the Service will be uninterrupted or error-free</li>
              <li>The accuracy of product prices or availability</li>
              <li>That any specific product will be available for purchase</li>
            </ul>
          </Section>

          <Section title="9. Limitation of liability">
            <p>To the maximum extent permitted by law, Bump &amp; Bundle shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed £100.</p>
          </Section>

          <Section title="10. Governing law">
            <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="11. Changes to these terms">
            <p>We may update these terms from time to time. We will notify you of material changes by email or by a prominent notice on the website. Continued use of the Service after changes constitutes acceptance.</p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions about these terms, contact us at <a href="mailto:hello@bumpandbundle.com" className="text-primary">hello@bumpandbundle.com</a>.</p>
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
