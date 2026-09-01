"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Sun,
  Snowflake,
  Layers,
  Search,
  Grid3X3,
  LayoutTemplate,
  CheckCircle2,
  Tag,
  Shield,
  Flame,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Category, Product } from "@/types";
import { formatPrice } from "@/lib/utils";

type DepartmentFilter =
  | "All"
  | "Sartorial & Formal"
  | "Outerwear & Leather"
  | "Streetwear & Knits"
  | "Pants & Trousers"
  | "Accessories & Goods"
  | "Seasonal Drops";

interface CategoryWithMeta extends Category {
  department: string;
  craftsmanship: string;
  minPrice: number;
  featuredGarments: Product[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<DepartmentFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "editorial">("grid");
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success) {
          setCategories(catData.data);
        }
        if (prodData.success) {
          setProducts(prodData.data);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Map categories to enhanced departments, craftsmanship tags, and top products
  const enhancedCategories: CategoryWithMeta[] = useMemo(() => {
    return categories.map((cat) => {
      let department = "Streetwear & Knits";
      let craftsmanship = "Luxury Standard";

      const catLower = cat.name.toLowerCase();

      if (cat.type === "Season") {
        department = "Seasonal Drops";
        craftsmanship = catLower.includes("summer")
          ? "Airy Pima Cotton & Italian Linen"
          : "680gsm Melton Wool & Cashmere";
      } else if (catLower.includes("formal") || catLower.includes("shirt")) {
        department = "Sartorial & Formal";
        craftsmanship = "Super 130s Wool & Mulberry Silk";
      } else if (catLower.includes("jacket") || catLower.includes("outerwear")) {
        department = "Outerwear & Leather";
        craftsmanship = "Full-Grain Italian Calfskin";
      } else if (catLower.includes("pant") || catLower.includes("jean")) {
        department = "Pants & Trousers";
        craftsmanship = catLower.includes("jean")
          ? "14.5oz Japanese Raw Selvedge"
          : "Italian Pleated Virgin Wool";
      } else if (catLower.includes("accessor") || catLower.includes("boot") || catLower.includes("ring")) {
        department = "Accessories & Goods";
        craftsmanship = "Goodyear-Welted & 18K Vermeil";
      } else {
        department = "Streetwear & Knits";
        craftsmanship = "520gsm Heavy Organic French Terry";
      }

      // Filter products matching this category or season
      const matchedProducts = products.filter((p) => {
        if (cat.type === "Season") {
          return p.season.toLowerCase() === cat.name.toLowerCase();
        }
        return p.category.toLowerCase() === cat.name.toLowerCase();
      });

      const minPrice = matchedProducts.length > 0
        ? Math.min(...matchedProducts.map((p) => p.discountPrice ?? p.price))
        : 85;

      return {
        ...cat,
        department,
        craftsmanship,
        minPrice,
        featuredGarments: matchedProducts.slice(0, 3),
      };
    });
  }, [categories, products]);

  // Filter based on Department and Search query
  const filteredCategories = useMemo(() => {
    return enhancedCategories.filter((cat) => {
      if (activeDepartment !== "All" && cat.department !== activeDepartment) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesDesc = cat.description.toLowerCase().includes(q);
        const matchesCraft = cat.craftsmanship.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCraft) return false;
      }
      return true;
    });
  }, [enhancedCategories, activeDepartment, searchQuery]);

  const seasonalCategories = enhancedCategories.filter((c) => c.type === "Season");
  const clothingCategories = filteredCategories.filter((c) => c.type !== "Season");

  const departments: DepartmentFilter[] = [
    "All",
    "Sartorial & Formal",
    "Outerwear & Leather",
    "Streetwear & Knits",
    "Pants & Trousers",
    "Accessories & Goods",
    "Seasonal Drops",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header Hero with Luxury Accents */}
      <div className="relative text-center max-w-4xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181f]/80 border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] shadow-gold">
          <Sparkles className="w-3.5 h-3.5" />
          The Haute Sartorial Catalog
        </div>

        <h1 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
          Bespoke Departments & Collections
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Explore our signature tailoring houses, raw Japanese denim mills, heavy-knit streetwear atelier, and limited vault editions.
        </p>

        {/* Value Highlights */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> 12 Specialty Houses
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Artisanal Small-Batch Runs
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Certified Raw Luxury
          </span>
        </div>
      </div>

      {/* 2. Interactive Navigation Controls: Search, Department Tabs & View Mode */}
      <div className="space-y-4 border-y border-[#24242B] py-6 bg-[#0e0e11]/60 backdrop-blur-md rounded-2xl p-4 sm:p-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search category, fabric or cut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#141418] border border-zinc-800 focus:border-[#D4AF37] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider hidden sm:inline">
              Layout Style:
            </span>
            <div className="flex items-center rounded-xl bg-[#141418] p-1 border border-zinc-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === "grid"
                    ? "bg-[#D4AF37] text-black shadow-gold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" /> Grid Mode
              </button>
              <button
                onClick={() => setViewMode("editorial")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === "editorial"
                    ? "bg-[#D4AF37] text-black shadow-gold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> Editorial Lookbook
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          {departments.map((dept) => {
            const isActive = activeDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#E5C365] text-black shadow-gold"
                    : "bg-[#141418] text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Seasonal Drops Spotlight (If All or Seasonal is selected) */}
      {(activeDepartment === "All" || activeDepartment === "Seasonal Drops") &&
        seasonalCategories.length > 0 &&
        !searchQuery && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#24242B] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-black text-white">
                  Seasonal Vault Lookbooks
                </h2>
              </div>
              <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">
                2 Curated Releases
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {seasonalCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?season=${encodeURIComponent(cat.name)}`}
                  className="relative rounded-3xl overflow-hidden aspect-[16/10] border border-zinc-800 hover:border-[#D4AF37] transition-all duration-500 group shadow-2xl flex flex-col justify-end"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Seasonal Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37]">
                      {cat.name.includes("Summer") ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Snowflake className="w-4 h-4 text-blue-400" />
                      )}
                      {cat.name}
                    </span>
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 space-y-3 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      {cat.craftsmanship} • {cat.itemCount} Signature Pieces
                    </span>
                    <h3 className="font-serif-luxury text-2xl sm:text-4xl font-black group-hover:text-[#FAF8F5]">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 max-w-lg line-clamp-2">
                      {cat.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">
                        Pieces From <strong className="text-white text-sm">{formatPrice(cat.minPrice)}</strong>
                      </span>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider group-hover:bg-[#D4AF37] transition-colors shadow-lg">
                        Explore Drop <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      {/* 4. Category Listings (Grid View Mode vs Editorial View Mode) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[#24242B] pb-4">
          <div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-black text-white">
              {activeDepartment === "All" ? "Atelier Garment Departments" : activeDepartment}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Showing {clothingCategories.length} department categories
            </p>
          </div>
        </div>

        {clothingCategories.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-[#141418] border border-zinc-800 space-y-4">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="font-serif-luxury text-xl font-bold text-white">
              No matching categories found
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No department matches your current search criteria. Try clearing the filter.
            </p>
            <button
              onClick={() => {
                setActiveDepartment("All");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clothingCategories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredCategoryId(cat.id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                className="group relative rounded-3xl overflow-hidden bg-[#141418] border border-[#24242B] hover:border-[#D4AF37] transition-all duration-500 shadow-xl flex flex-col justify-between"
              >
                {/* Media Link */}
                <Link
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="relative block aspect-[4/5] w-full overflow-hidden bg-zinc-900"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/40 to-transparent" />

                  {/* Top Craftsmanship Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30">
                      {cat.craftsmanship}
                    </span>
                  </div>

                  {/* Item count tag */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-900/80 text-zinc-300 backdrop-blur-md border border-zinc-700">
                      {cat.itemCount} Items
                    </span>
                  </div>

                  {/* Bottom Text in Image */}
                  <div className="absolute inset-x-0 bottom-0 p-5 space-y-1 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      Department
                    </span>
                    <h3 className="font-serif-luxury text-2xl font-bold group-hover:text-[#D4AF37] transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>

                {/* Card Details & Mini-Product Peek Ribbon */}
                <div className="p-5 bg-[#121216] border-t border-zinc-800/80 space-y-3">
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Mini Product Peek Strip */}
                  {cat.featuredGarments.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1.5">
                        <span>Trending In House:</span>
                        <span className="text-[#D4AF37]">From {formatPrice(cat.minPrice)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.featuredGarments.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/product/${prod.id}`}
                            className="relative w-12 h-14 rounded-lg overflow-hidden border border-zinc-800 hover:border-[#D4AF37] transition-colors shrink-0 group/thumb"
                            title={`${prod.name} - ${formatPrice(prod.discountPrice ?? prod.price)}`}
                          >
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              className="object-cover object-center group-hover/thumb:scale-110 transition-transform"
                            />
                          </Link>
                        ))}
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className="flex-1 py-3 px-2 rounded-lg bg-[#181820] hover:bg-[#D4AF37] text-zinc-300 hover:text-black font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                        >
                          View All <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* EDITORIAL LOOKBOOK VIEW MODE */
          <div className="space-y-12">
            {clothingCategories.map((cat, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl`}
                >
                  {/* Visual Editorial Image */}
                  <div className="relative w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto min-h-[350px] bg-zinc-900 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 text-[11px] font-black uppercase tracking-wider text-[#D4AF37]">
                      {cat.craftsmanship}
                    </div>
                  </div>

                  {/* Editorial Text Content */}
                  <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                        <span>House No. 0{idx + 1}</span>
                        <span>{cat.itemCount} Bespoke Garments</span>
                      </div>

                      <h3 className="font-serif-luxury text-3xl sm:text-4xl font-black text-white">
                        {cat.name}
                      </h3>

                      <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">
                        {cat.description}
                      </p>

                      {/* Featured Pieces in this Category */}
                      {cat.featuredGarments.length > 0 && (
                        <div className="pt-4 space-y-2 border-t border-zinc-800/80">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            Signature Garments:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cat.featuredGarments.slice(0, 2).map((prod) => (
                              <Link
                                key={prod.id}
                                href={`/product/${prod.id}`}
                                className="flex items-center gap-3 p-2 rounded-xl bg-[#16161c] hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
                              >
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                                  <Image
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-zinc-200 truncate">{prod.name}</p>
                                  <p className="text-[10px] text-[#D4AF37] font-semibold">
                                    {formatPrice(prod.discountPrice ?? prod.price)}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Starting At</span>
                        <p className="font-bold text-xl text-[#FAF8F5]">{formatPrice(cat.minPrice)}</p>
                      </div>

                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-gold"
                      >
                        Shop {cat.name} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
