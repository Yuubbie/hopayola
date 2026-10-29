import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";
import IntroSplash from "@/components/IntroSplash";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PwaInstall from "@/components/PwaInstall";
import HelpChat from "@/components/HelpChat";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hopayola.com"),
  title: {
    default: "Hopayola | Custom outfits with Nigerian artisans",
    template: "%s | Hopayola",
  },
  description:
    "Commission a custom outfit in Nigeria. Hopayola matches you with a vetted artisan, holds payment, and coordinates fabric, design studio, and delivery.",
  keywords: [
    "custom outfit Nigeria",
    "tailor Abuja",
    "bespoke fashion Nigeria",
    "hire a tailor",
    "fashion artisan",
    "Hopayola",
  ],
  alternates: { canonical: "https://www.hopayola.com" },
  manifest: "/manifest.webmanifest",
  themeColor: "#5b2d8e",
  appleWebApp: {
    capable: true,
    title: "Hopayola",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Hopayola | Custom outfits with Nigerian artisans",
    description:
      "Commission a custom outfit in Nigeria. Hopayola matches you with a vetted artisan, holds payment, and coordinates fabric, design studio, and delivery.",
    url: "https://www.hopayola.com",
    siteName: "Hopayola",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopayola | Custom outfits with Nigerian artisans",
    description:
      "Commission a custom outfit in Nigeria. Vetted artisans, held payment, design studio.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "google82859dfdd6727ab1.html",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} font-body bg-paper text-ink antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hopayola",
              url: "https://www.hopayola.com",
              logo: "https://www.hopayola.com/images/logo.png",
              email: "support@hopayola.com",
              telephone: "+2347026888665",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Abuja",
                addressCountry: "NG",
              },
              sameAs: [
                "https://www.instagram.com/hopayola",
                "https://www.tiktok.com/@hopayola",
                "https://x.com/hopayola",
                "https://www.facebook.com/hopayolaltd",
              ],
            }),
          }}
        />
        <GoogleAnalytics />
        <IntroSplash />
        <AppChrome>{children}</AppChrome>
        <PwaInstall />
        <HelpChat />
      </body>
    </html>
  );
}
