import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dwelliq - Modern Real Estate Platform",
    template: "%s | Dwelliq",
  },
  description:
    "Discover and sell properties with Dwelliq. Browse listings, connect with buyers and sellers, and manage your real estate transactions seamlessly.",
  keywords: ["real estate", "property", "listings", "buy", "sell", "Dwelliq"],
  authors: [{ name: "Dwelliq" }],
  creator: "Dwelliq",
  publisher: "Dwelliq",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dwelliq.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Dwelliq",
    title: "Dwelliq - Modern Real Estate Platform",
    description:
      "Discover and sell properties with Dwelliq. Browse listings, connect with buyers and sellers, and manage your real estate transactions seamlessly.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dwelliq - Modern Real Estate Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dwelliq - Modern Real Estate Platform",
    description:
      "Discover and sell properties with Dwelliq. Browse listings, connect with buyers and sellers, and manage your real estate transactions seamlessly.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Dwelliq",
  description:
    "Modern real estate platform for buying and selling properties",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://dwelliq.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Skip link as the first focusable element */}
          <a
            href="#main-content"
            className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
          >
            Skip to content
          </a>

          <Header />
          {/* Focusable main */}
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />

          {/* Robust skip-link focus: works pre-hydration, in WebKit, and via keyboard/mouse */}
          <Script
            id="skip-link-focus"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  function focusTarget(id) {
                    var el = document.getElementById(id);
                    if (!el) return;
                    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
                    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
                    el.scrollIntoView({ block: 'start' });
                  }

                  // On initial load with hash
                  if (location.hash === '#main-content') {
                    // Next tick to allow layout
                    setTimeout(function(){ focusTarget('main-content'); }, 0);
                  }

                  // On any future hash navigation
                  window.addEventListener('hashchange', function() {
                    if (location.hash === '#main-content') {
                      // Allow scroll first, then focus
                      requestAnimationFrame(function(){ focusTarget('main-content'); });
                    }
                  }, { passive: true });
                })();
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
