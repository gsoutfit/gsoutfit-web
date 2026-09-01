import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Gentleman Savage | Luxury Fashion & Modern Streetwear",
  description:
    "Sophisticated tailoring meets raw contemporary streetwear. Discover bespoke calfskin jackets, virgin wool overcoats, 520gsm hoodies, and luxury menswear drops.",
  keywords: [
    "Gentleman Savage",
    "Luxury menswear",
    "Tailored suits",
    "Leather jackets",
    "Streetwear fashion",
    "Cashmere sweaters",
    "Japanese selvedge denim",
  ],
  authors: [{ name: "Gentleman Savage" }],
  openGraph: {
    title: "Gentleman Savage | Luxury Fashion & Modern Streetwear",
    description:
      "Where sophisticated tailoring meets raw contemporary streetwear. Mastercrafted apparel for the modern icon.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0B0C] text-[#FAF8F5] antialiased min-h-screen flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
