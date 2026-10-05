import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntroSplash from "@/components/IntroSplash";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PwaInstall from "@/components/PwaInstall";

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
  title: "Hopayola — Plan and coordinate your fashion project",
  description:
    "Hopayola connects you with fashion talent and coordinates the creation of your outfit, from measurements to delivery.",
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
    title: "Hopayola — Plan and coordinate your fashion project",
    description:
      "Hopayola connects you with fashion talent and coordinates the creation of your outfit, from measurements to delivery.",
    url: "https://www.hopayola.com",
    siteName: "Hopayola",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopayola — Plan and coordinate your fashion project",
    description:
      "Hopayola connects you with fashion talent and coordinates the creation of your outfit, from measurements to delivery.",
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
        <GoogleAnalytics />
        <IntroSplash />
        <Navbar />
        {children}
        <Footer />
        <PwaInstall />
      </body>
    </html>
  );
}
