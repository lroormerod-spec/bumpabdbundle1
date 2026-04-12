import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bumpandbundle.com"),
  title: {
    default: "Bump & Bundle — UK Baby Registry",
    template: "%s | Bump & Bundle",
  },
  description:
    "Create your perfect baby registry. Compare prices across 14 UK retailers, share with family and friends, and get alerts when prices drop.",
  keywords: ["baby registry", "baby shower", "UK baby gifts", "pregnancy", "newborn"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://bumpandbundle.com",
    siteName: "Bump & Bundle",
    title: "Bump & Bundle — UK Baby Registry",
    description:
      "Create your perfect baby registry. Compare prices across 14 UK retailers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bump & Bundle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bump & Bundle — UK Baby Registry",
    description: "Create your perfect baby registry. Compare prices across 14 UK retailers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={plusJakartaSans.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
