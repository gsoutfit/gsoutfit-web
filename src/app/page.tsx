"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Flame,
  Star,
  Shield,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Sun,
  Snowflake,
  ShoppingBag,
  Layers,
  Check,
} from "lucide-react";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeArrivalTab, setActiveArrivalTab] = useState<string>("All");
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [addedLookId, setAddedLookId] = useState<string | null>(null);

  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, trendRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/products?trending=true"),
          fetch("/api/categories"),
        ]);
        const prodData = await prodRes.json();
        const trendData = await trendRes.json();
        const catData = await catRes.json();

        if (trendData.success) {
          setTrendingProducts(trendData.data.slice(0, 4));
        }

        if (prodData.success) {
          const prods: Product[] = prodData.data;
          if (!trendData.success) {
            setTrendingProducts(prods.filter((p) => p.isTrending).slice(0, 4));
          }
          setNewArrivals(prods.filter((p) => p.isNewArrival));
          setBestSellers(prods.filter((p) => p.isBestSeller).slice(0, 4));
          setFlashSaleProducts(prods.filter((p) => p.isFlashSale).slice(0, 4));
        }

        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    }
    fetchData();
  }, []);

  // Flash sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredArrivals =
    activeArrivalTab === "All"
      ? newArrivals.slice(0, 8)
      : newArrivals
          .filter((p) => p.category.toLowerCase() === activeArrivalTab.toLowerCase())
          .slice(0, 8);

  const curatedLooks = [
    {
      id: "look-1",
      title: "The Midnight Executive",
      subtitle: "Tailored Silk-Blend Tuxedo + Italian Wool Pleated Trousers",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
      theme: "Gentleman Tailoring",
      tag: "Red Carpet & Gala",
      price: "$705.00",
      items: [
        { name: "Tailored Silk-Blend Tuxedo Blazer", price: "$460.00" },
        { name: "Italian Virgin Wool Pleated Trousers", price: "$185.00" },
        { name: "Savage 18K Gold & Onyx Signet Ring", price: "$75.00" },
      ],
    },
    {
      id: "look-2",
      title: "The Tokyo Rebel",
      subtitle: "Obsidian Raw Leather Biker + 14.5oz Japanese Selvedge Denim",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
      theme: "Raw Streetwear",
      tag: "Nightlife & City",
      price: "$607.00",
      items: [
        { name: "Obsidian Raw Leather Biker Jacket", price: "$390.00" },
        { name: "Vintage Washed Acid Drop Tee", price: "$52.00" },
        { name: "Distressed Raw Selvedge Denim Jeans", price: "$165.00" },
      ],
    },
  ];

  const clothingCategories = categories.filter((c) => c.type !== "Season");

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#070708] border-b border-[#202026]">
        {/* Background Editorial Image with Luxury Gradient Vignette */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=2000&q=90"
            alt="Gentleman Savage Luxury Collection"
            fill
            priority
            className="object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-20">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181f]/80 border border-[#D4AF37]/40 backdrop-blur-md text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37] shadow-gold">
            <Sparkles className="w-3.5 h-3.5" />
            Autumn / Winter 2026 Sartorial Drop
          </div>

          {/* Luxury Main Heading */}
          <div className="space-y-3">
            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-tight">
              Sophisticated <span className="italic font-normal text-[#D4AF37]">Tailoring</span>.<br />
              Raw <span className="underline decoration-[#D4AF37]/60 underline-offset-8">Luxury</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
              Uncompromising craftsmanship for the modern icon. Italian virgin wools, full-grain calfskin leathers, and heavyweight 520gsm bespoke essentials.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#D4AF37] to-[#A98725] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-gold-lg"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/categories"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#141418]/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all border border-zinc-700/80 backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" /> Visual Lookbooks
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> 100% Full-Grain Leathers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Super 130s Italian Wool
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Complimentary VIP Delivery
            </span>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY HORIZONTAL NAV RIBBON */}
      {clothingCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#121216]/95 border border-[#24242B] shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                <Layers className="w-4 h-4" /> Quick Department Access
              </div>
              <Link
                href="/categories"
                className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center gap-1 transition-colors"
              >
                All Departments <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </Link>
            </div>

            {/* Horizontal Scroll Pill Gallery */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {clothingCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center gap-3 p-2 pr-4 rounded-2xl bg-[#181820] hover:bg-zinc-800/90 border border-zinc-800 hover:border-[#D4AF37]/50 transition-all shrink-0"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-700">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100 group-hover:text-[#D4AF37] transition-colors whitespace-nowrap">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {cat.itemCount} Garments
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#202026] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-1">
              <Flame className="w-4 h-4 text-rose-500" />
              Highest Demand Right Now
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black tracking-tight text-white">
              Trending Garments
            </h2>
          </div>

          <Link
            href="/shop?sort=trending"
            className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#E5C365] flex items-center gap-1 transition-colors"
          >
            View All Trending Drops <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* 3. SEASONAL COLLECTIONS SPLIT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Summer Collection Card */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] border border-amber-500/30 group">
            <Image
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
              alt="Summer Collection"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-3 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Sun className="w-4 h-4" /> Summer Collection 2026
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-black">
                Airy Linens & Silk Resort Knits
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                Camp collar shirts, tailored linen drawstrings, and breathable pima cottons designed for high-heat elegance.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop?season=Summer+Collection"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Shop Summer Drop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Winter Collection Card */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] border border-blue-500/30 group">
            <Image
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80"
              alt="Winter Collection"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-3 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                <Snowflake className="w-4 h-4" /> Winter Collection 2026
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-black">
                Heavy Cashmere & Overcoats
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                Virgin wool double-breasted coats, raw calfskin biker jackets, and insulating mock-neck knits.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop?season=Winter+Collection"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Shop Winter Drop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLASH SALE & LIMITED STOCK SECTION (with live timer) */}
      <section className="bg-gradient-to-r from-red-950/40 via-[#121216] to-red-950/40 border-y border-red-500/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#16161c] p-6 sm:p-8 rounded-3xl border border-red-500/30 shadow-2xl">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                <Flame className="w-3.5 h-3.5" /> Limited Flash Drop
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-black text-white">
                Exclusive Vault Markdown — Up to 25% OFF
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                Strictly limited quantities. Once these handcrafted pieces are claimed, they will not be reissued this season.
              </p>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3 text-center">
              <div className="px-4 py-3 rounded-2xl bg-[#0e0e12] border border-zinc-700 min-w-[60px] sm:min-w-[70px]">
                <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#D4AF37]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hours</span>
              </div>
              <span className="text-2xl font-bold text-zinc-600">:</span>
              <div className="px-4 py-3 rounded-2xl bg-[#0e0e12] border border-zinc-700 min-w-[60px] sm:min-w-[70px]">
                <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#D4AF37]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mins</span>
              </div>
              <span className="text-2xl font-bold text-zinc-600">:</span>
              <div className="px-4 py-3 rounded-2xl bg-[#0e0e12] border border-zinc-700 min-w-[60px] sm:min-w-[70px]">
                <span className="block font-mono text-2xl sm:text-3xl font-bold text-rose-500">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Secs</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS WITH CATEGORY SWITCHER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#202026] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Curated Masterpieces
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
              New Seasonal Arrivals
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {["All", "Jackets", "Hoodies", "Shirts", "Pants", "Accessories"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveArrivalTab(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeArrivalTab === cat
                    ? "bg-[#D4AF37] text-black shadow-gold"
                    : "bg-[#18181f] text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#18181f] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Explore Complete {filteredArrivals.length}+ Item Catalogue <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>
        </div>
      </section>

      {/* 6. CURATED OUTFIT SUGGESTIONS / LOOKBOOK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            Complete The Look
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white">
            Editorial Outfits & Pairings
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Hand-styled by our master tailors. Add curated entire looks directly to your bag.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {curatedLooks.map((look) => (
            <div
              key={look.id}
              className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden flex flex-col md:flex-row group hover:border-[#D4AF37]/40 transition-colors"
            >
              {/* Media */}
              <div className="relative w-full md:w-1/2 aspect-square sm:aspect-[3/4] md:aspect-auto max-h-[400px] md:max-h-none bg-zinc-900">
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  {look.tag}
                </div>
              </div>

              {/* Items List & Price */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {look.theme}
                  </span>
                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-black text-white mt-1">
                    {look.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{look.subtitle}</p>

                  <div className="mt-5 space-y-2.5 pt-4 border-t border-zinc-800/80">
                    {look.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300">{item.name}</span>
                        <span className="font-bold text-zinc-100">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Complete Look</span>
                    <p className="font-bold text-lg text-[#FAF8F5]">{look.price}</p>
                  </div>

                  <Link
                    href={`/shop?search=${encodeURIComponent(look.theme)}`}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-gold"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Shop Look
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BEST-SELLING SUITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-[#202026] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Customer Favorites
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
              Best-Selling Icons
            </h2>
          </div>
          <Link
            href="/shop?sort=rating"
            className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            View Top Rated <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. CLIENT REVIEWS & TESTIMONIALS */}
      <section className="bg-[#0e0e12] border-y border-[#202026] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-1 text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white">
              Words From The Gentlemen
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Over 1,200+ verified 5-star ratings across our global discerning clientele.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#141418] border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Client
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                &ldquo;The Obsidian Calfskin Biker is hands-down the finest leather jacket I have ever touched. The asymmetric drape and gunmetal zips make an unforgettable statement in London or New York.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <div className="w-9 h-9 rounded-full bg-zinc-800 relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                    alt="Marcus Vance"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-100">Marcus Vance</h4>
                  <p className="text-[10px] text-zinc-500">Purchased: Obsidian Biker Jacket (L)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141418] border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Client
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                &ldquo;The Silk Tuxedo was custom-fit out of the box. Wore it to a high-society charity gala and received non-stop accolades on the grosgrain lapels. Exceptional value for bespoke quality.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <div className="w-9 h-9 rounded-full bg-zinc-800 relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                    alt="Lord Charles"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-100">Lord Charles Kensington</h4>
                  <p className="text-[10px] text-zinc-500">Purchased: Silk Tuxedo Blazer (40R)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141418] border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Client
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                &ldquo;The 520gsm French terry hoodie has that heavy, structured luxury streetwear drape that cheap brands cannot replicate. Will be ordering the washed slate next!&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <div className="w-9 h-9 rounded-full bg-zinc-800 relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80"
                    alt="Tyler Bennett"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-100">Tyler Bennett</h4>
                  <p className="text-[10px] text-zinc-500">Purchased: Heavyweight Street Hoodie (M)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
