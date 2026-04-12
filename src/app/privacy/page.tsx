import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bump & Bundle",
  description: "How Bump & Bundle collects, uses and protects your personal data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

          <Section title="1. Who we are">
            <p>Bump &amp; Bundle (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website bumpandbundle.com. We are committed to protecting your personal data and respecting your privacy. This policy explains what data we collect, why we collect it, and how we use it.</p>
            <p>If you have any questions, contact us at: <a href="mailto:hello@bumpandbundle.com" className="text-primary">hello@bumpandbundle.com</a></p>
          </Section>

          <Section title="2. What data we collect">
            <ul>
              <li><strong>Email address</strong> — collected when you sign in via our one-time code system. Used to identify your account and send sign-in codes.</li>
              <li><strong>Name</strong> — provided by you when setting up your registry. Used to personalise your experience and your registry page.</li>
              <li><strong>Registry data</strong> — product wishlists, due dates, and registry preferences you choose to add.</li>
              <li><strong>Usage data</strong> — pages visited, search queries made within the app. Used to improve the service. This data is anonymised and aggregated.</li>
              <li><strong>Device &amp; browser data</strong> — IP address, browser type, device type. Collected automatically for security and performance purposes.</li>
            </ul>
          </Section>

          <Section title="3. How we use your data">
            <ul>
              <li>To provide and operate the Bump &amp; Bundle service</li>
              <li>To send you sign-in codes and important account notifications</li>
              <li>To display price drop alerts and registry updates</li>
              <li>To personalise your dashboard and registry experience</li>
              <li>To improve our service through anonymised analytics</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>We will never sell your personal data to third parties.</p>
          </Section>

          <Section title="4. Legal basis for processing">
            <p>We process your data under the following lawful bases (UK GDPR):</p>
            <ul>
              <li><strong>Contract</strong> — processing necessary to provide you with the service you&apos;ve signed up for</li>
              <li><strong>Legitimate interests</strong> — improving our service, preventing fraud, and ensuring security</li>
              <li><strong>Consent</strong> — where you have explicitly agreed, such as optional marketing communications</li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>We use essential cookies to keep you signed in and maintain your session. We do not use advertising or tracking cookies. See our <Link href="/cookies" className="text-primary">Cookie Policy</Link> for full details.</p>
          </Section>

          <Section title="6. Third-party services">
            <p>We use the following third-party services which may process your data:</p>
            <ul>
              <li><strong>Resend</strong> — email delivery service used to send sign-in codes</li>
              <li><strong>Neon</strong> — database hosting provider (data stored in the EU/US)</li>
              <li><strong>Vercel</strong> — website hosting and infrastructure</li>
              <li><strong>SerpAPI</strong> — product search API (search queries only, no personal data shared)</li>
            </ul>
            <p>All third-party providers are contractually obligated to protect your data in accordance with applicable data protection law.</p>
          </Section>

          <Section title="7. Affiliate links">
            <p>Our site contains affiliate links to UK retailers. When you click these links and make a purchase, we may earn a commission. No personal data is shared with retailers beyond what is standard for any web referral. See our <Link href="/affiliate-disclosure" className="text-primary">Affiliate Disclosure</Link> for more information.</p>
          </Section>

          <Section title="8. Data retention">
            <p>We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required to retain it for legal purposes.</p>
          </Section>

          <Section title="9. Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability — receive your data in a machine-readable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:hello@bumpandbundle.com" className="text-primary">hello@bumpandbundle.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>We may update this policy from time to time. We will notify you of significant changes by email or by a prominent notice on our website. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
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
