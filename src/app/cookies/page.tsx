import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | Bump & Bundle",
  description: "How Bump & Bundle uses cookies.",
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
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
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

          <Section title="What are cookies?">
            <p>Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit and improve your experience.</p>
          </Section>

          <Section title="How we use cookies">
            <p>Bump &amp; Bundle uses a minimal number of cookies. We do not use advertising cookies, tracking cookies, or sell any data derived from cookies to third parties.</p>
          </Section>

          <Section title="Cookies we use">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold text-foreground">Cookie</th>
                    <th className="text-left p-3 font-semibold text-foreground">Type</th>
                    <th className="text-left p-3 font-semibold text-foreground">Purpose</th>
                    <th className="text-left p-3 font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-3 font-mono text-xs">bb_session</td>
                    <td className="p-3">Essential</td>
                    <td className="p-3">Keeps you signed in to your account</td>
                    <td className="p-3">30 days</td>
                  </tr>
                  <tr className="border-t border-border bg-muted/30">
                    <td className="p-3 font-mono text-xs">bb_theme</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">Remembers your light/dark mode preference</td>
                    <td className="p-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Essential cookies">
            <p>Essential cookies are necessary for the website to function. They enable core features such as keeping you signed in. You cannot opt out of essential cookies while using the Service.</p>
          </Section>

          <Section title="Third-party cookies">
            <p>We do not place third-party advertising or analytics cookies on your device. Our infrastructure providers (Vercel, Neon) may set technical cookies necessary for their services to operate. These are governed by their respective privacy policies.</p>
          </Section>

          <Section title="Managing cookies">
            <p>You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from staying signed in to your account.</p>
            <p>Browser-specific guidance:</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary">Microsoft Edge</a></li>
            </ul>
          </Section>

          <Section title="Contact">
            <p>If you have questions about our use of cookies, contact us at <a href="mailto:hello@bumpandbundle.com" className="text-primary">hello@bumpandbundle.com</a>.</p>
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
