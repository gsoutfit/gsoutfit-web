"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { SizeGuideModal } from "./SizeGuideModal";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const { t } = useLanguage();

  // Hide footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubscribed(true);
  };

  return (
    <>
      {/* Brand Value Props Banner */}
      <section className="bg-[#0e0e11] border-y border-[#202026] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#18181f] text-[#D4AF37] border border-[#2A2A33] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                {t("footer_complimentary_shipping")}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t("footer_shipping_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#18181f] text-[#D4AF37] border border-[#2A2A33] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                {t("footer_exchange_title")}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t("footer_exchange_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#18181f] text-[#D4AF37] border border-[#2A2A33] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                {t("footer_craftsmanship_title")}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t("footer_craftsmanship_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#18181f] text-[#D4AF37] border border-[#2A2A33] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                {t("footer_payment_title")}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t("footer_payment_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Luxury Footer */}
      <footer className="bg-[#080809] border-t border-[#1a1a20] text-zinc-300 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#202026]">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <span className="font-cinzel text-2xl font-black tracking-[0.25em] text-white">
                  GENTLEMAN
                </span>
                <span className="block text-[10px] font-extrabold tracking-[0.5em] text-[#D4AF37] uppercase">
                  SAVAGE
                </span>
              </Link>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Where sophisticated tailoring meets raw contemporary streetwear. Gentleman Savage crafts uncompromising garments for individuals who demand timeless elegance with an unapologetic modern edge.
              </p>

              {/* VIP Club / Newsletter Form */}
              <div className="pt-2">
                <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Join The Inner Circle & Unlock 20% OFF
                </p>

                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your VIP email address..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0"
                    >
                      Join <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs text-zinc-200 space-y-1 animate-fade-in">
                    <p className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Welcome to the Circle!
                    </p>
                    <p className="text-[11px] text-zinc-300">
                      Use secret code <strong className="text-[#FAF8F5] underline">SAVAGE20</strong> at checkout for 20% off your entire first order.
                    </p>
                  </div>
                )}
              </div>

              {/* Official Social Media Channels */}
              <div className="pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2.5">
                  Official Channels
                </p>
                <div className="flex items-center gap-2.5">
                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@gentlemen.savage"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Gentleman Savage on TikTok"
                    className="p-2.5 rounded-xl bg-[#141418] hover:bg-[#1c1c22] border border-zinc-800 hover:border-[#D4AF37]/60 text-zinc-400 hover:text-[#D4AF37] transition-all flex items-center justify-center group"
                    title="TikTok"
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.89-2.88 2.89 2.89 0 0 1 2.89-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V8.87c1.37.98 3.03 1.57 4.83 1.57v-3.5c-.32 0-.63-.08-.92-.25z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/gsoutfit_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Gentleman Savage on Instagram"
                    className="p-2.5 rounded-xl bg-[#141418] hover:bg-[#1c1c22] border border-zinc-800 hover:border-[#D4AF37]/60 text-zinc-400 hover:text-[#D4AF37] transition-all flex items-center justify-center group"
                    title="Instagram"
                  >
                    <svg
                      className="w-4 h-4 fill-none stroke-current stroke-2 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/people/Gentlemen-Savage-Outfit/61593776529569/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Gentleman Savage on Facebook"
                    className="p-2.5 rounded-xl bg-[#141418] hover:bg-[#1c1c22] border border-zinc-800 hover:border-[#D4AF37]/60 text-zinc-400 hover:text-[#D4AF37] transition-all flex items-center justify-center group"
                    title="Facebook"
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Collections */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#FAF8F5]">
                Collections
              </h5>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <Link href="/shop?category=Jackets" className="hover:text-[#D4AF37] transition-colors">
                    Leather Jackets & Overcoats
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Hoodies" className="hover:text-[#D4AF37] transition-colors">
                    520gsm Heavy Hoodies
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Formal+Wear" className="hover:text-[#D4AF37] transition-colors">
                    Silk-Blend Tuxedos & Blazers
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Shirts" className="hover:text-[#D4AF37] transition-colors">
                    Pima Cotton & Silk Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Pants" className="hover:text-[#D4AF37] transition-colors">
                    Pleated Wool Trousers
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Jeans" className="hover:text-[#D4AF37] transition-colors">
                    Japanese Selvedge Denim
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Accessories" className="hover:text-[#D4AF37] transition-colors">
                    Leather Boots & Gold Jewelry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Seasonal & Drops */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#FAF8F5]">
                Seasonal Drops
              </h5>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <Link href="/shop?season=Summer+Collection" className="hover:text-[#D4AF37] transition-colors">
                    Summer Collection 2026
                  </Link>
                </li>
                <li>
                  <Link href="/shop?season=Winter+Collection" className="hover:text-[#D4AF37] transition-colors">
                    Winter Collection 2026
                  </Link>
                </li>
                <li>
                  <Link href="/shop?flashSale=true" className="text-rose-400 hover:underline transition-colors font-semibold">
                    Limited Flash Sale Drops
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-[#D4AF37] transition-colors">
                    Visual Lookbooks
                  </Link>
                </li>
                <li>
                  <Link href="/shop?sort=trending" className="hover:text-[#D4AF37] transition-colors">
                    Trending Pieces
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Client Services */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#FAF8F5]">
                Client Concierge
              </h5>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                    Order Tracking & Status
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="hover:text-[#D4AF37] transition-colors text-left"
                  >
                    Bespoke Size & Fit Guide
                  </button>
                </li>
                <li>
                  <Link href="/account?tab=addresses" className="hover:text-[#D4AF37] transition-colors">
                    Shipping & Address Book
                  </Link>
                </li>
                <li>
                  <Link href="/account?tab=wishlist" className="hover:text-[#D4AF37] transition-colors">
                    Saved Favorites
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} Gentleman Savage Inc. All Rights Reserved. Mastercrafted Worldwide.</p>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-[#18181f] border border-[#D4AF37]/30 text-[#D4AF37]">
                CASH ON DELIVERY
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E2136E]/15 border border-[#E2136E]/40 text-[#ff4b94]">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F7931E]/15 border border-[#F7931E]/40 text-[#fca338]">
                NAGAD
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </>
  );
}
