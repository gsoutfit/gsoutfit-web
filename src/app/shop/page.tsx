"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  List,
  X,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  Search,
  ChevronDown,
  Loader2,
  Tag,
  Sun,
  Snowflake,
  Ruler,
  Layers,
  Share2,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { getCategoryDisplayName } from "@/lib/translations";

const ALL_CATEGORIES = [
  "All",
  "Jackets",
  "Hoodies",
  "Shirts",
  "T-Shirts",
  "Pants",
  "Jeans",
  "Formal Wear",
  "Casual Wear",
  "Streetwear",
  "Accessories",
];

const ALL_SEASONS = ["All", "Summer Collection", "Winter Collection", "All-Season"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38"];
const ALL_COLORS = [
  { name: "Black", hex: "#0F0F10" },
  { name: "Charcoal", hex: "#2E2E32" },
  { name: "Brown", hex: "#47281A" },
  { name: "Camel", hex: "#B5946B" },
  { name: "White", hex: "#F8F8F8" },
  { name: "Blue", hex: "#1B243B" },
  { name: "Green", hex: "#142B21" },
  { name: "Gold", hex: "#D4AF37" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get("category") || "All"
  );
  const [selectedSeason, setSelectedSeason] = useState<string>(
    searchParams?.get("season") || "All"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams?.get("size") || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    searchParams?.get("color") || ""
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    searchParams?.get("inStock") === "true"
  );
  const [flashSaleOnly, setFlashSaleOnly] = useState<boolean>(
    searchParams?.get("flashSale") === "true"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    searchParams?.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 800,
  ]);
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams?.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams?.get("sort") || "trending"
  );

  // Layout Grid mode
  const [gridCols, setGridCols] = useState<"4" | "3" | "list">("4");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync initial URL search params on mount or parameter changes
  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat) setSelectedCategory(cat);
    const season = searchParams?.get("season");
    if (season) setSelectedSeason(season);
    if (searchParams?.get("flashSale") === "true") setFlashSaleOnly(true);
    if (searchParams?.get("inStock") === "true") setInStockOnly(true);
    if (searchParams?.get("size")) setSelectedSize(searchParams.get("size")!);
    if (searchParams?.get("color")) setSelectedColor(searchParams.get("color")!);
    if (searchParams?.get("maxPrice")) setPriceRange([0, Number(searchParams.get("maxPrice"))]);
    const sort = searchParams?.get("sort");
    if (sort) setSortBy(sort);
    const q = searchParams?.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Two-way synchronization: update URL search query when filters are modified
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedSeason && selectedSeason !== "All") params.set("season", selectedSeason);
    if (selectedSize) params.set("size", selectedSize);
    if (selectedColor) params.set("color", selectedColor);
    if (inStockOnly) params.set("inStock", "true");
    if (flashSaleOnly) params.set("flashSale", "true");
    if (priceRange[1] < 800) params.set("maxPrice", String(priceRange[1]));
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (sortBy && sortBy !== "trending") params.set("sort", sortBy);

    const queryString = params.toString();
    const targetUrl = queryString ? `/shop?${queryString}` : "/shop";
    window.history.replaceState(null, "", targetUrl);
  }, [
    selectedCategory,
    selectedSeason,
    selectedSize,
    selectedColor,
    inStockOnly,
    flashSaleOnly,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  // Fetch all products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Shop fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category Filter
        if (
          selectedCategory !== "All" &&
          p.category.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }

        // Season Filter
        if (
          selectedSeason !== "All" &&
          p.season.toLowerCase() !== selectedSeason.toLowerCase()
        ) {
          return false;
        }

        // Size Filter
        if (selectedSize && !p.sizes.includes(selectedSize)) {
          return false;
        }

        // Color Filter
        if (
          selectedColor &&
          !p.colors.some((c) =>
            c.name.toLowerCase().includes(selectedColor.toLowerCase())
          )
        ) {
          return false;
        }

        // Price Filter
        const price = p.discountPrice ?? p.price;
        if (price < priceRange[0] || price > priceRange[1]) {
          return false;
        }

        // In Stock
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        // Flash Sale Only
        if (flashSaleOnly && !p.isFlashSale) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.price;
        const priceB = b.discountPrice ?? b.price;

        switch (sortBy) {
          case "price-low":
            return priceA - priceB;
          case "price-high":
            return priceB - priceA;
          case "rating":
            return b.rating - a.rating;
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "trending":
          default:
            return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
        }
      });
  }, [
    products,
    selectedCategory,
    selectedSeason,
    selectedSize,
    selectedColor,
    inStockOnly,
    flashSaleOnly,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSeason("All");
    setSelectedSize("");
    setSelectedColor("");
    setInStockOnly(false);
    setFlashSaleOnly(false);
    setPriceRange([0, 800]);
    setSearchQuery("");
    setSortBy("trending");
  };

  const handleCopyFilterLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast(
        t("filter_copy_link"),
        t("filter_link_copied"),
        "gold"
      );
    }
  };

  const getSortDisplayName = (key: string) => {
    switch (key) {
      case "newest":
        return t("sort_newest");
      case "price-low":
        return t("sort_price_low");
      case "price-high":
        return t("sort_price_high");
      case "rating":
        return t("sort_rating");
      case "trending":
      default:
        return t("sort_trending");
    }
  };

  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedSeason !== "All" ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (flashSaleOnly ? 1 : 0) +
    (priceRange[1] < 800 ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (sortBy !== "trending" ? 1 : 0);

  // Quick Preset Handlers
  const quickPresets = [
    {
      id: "flash",
      label: t("filter_preset_flash_sale"),
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />,
      isActive: flashSaleOnly,
      toggle: () => setFlashSaleOnly(!flashSaleOnly),
    },
    {
      id: "bestsellers",
      label: t("filter_preset_bestsellers"),
      icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
      isActive: sortBy === "trending" && !flashSaleOnly && selectedCategory === "All",
      toggle: () => {
        setSortBy("trending");
        setFlashSaleOnly(false);
      },
    },
    {
      id: "new_drops",
      label: t("filter_preset_new_drops"),
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
      isActive: sortBy === "newest",
      toggle: () => setSortBy(sortBy === "newest" ? "trending" : "newest"),
    },
    {
      id: "winter",
      label: "Winter Drop",
      icon: <Snowflake className="w-3.5 h-3.5 text-blue-400" />,
      isActive: selectedSeason === "Winter Collection",
      toggle: () =>
        setSelectedSeason(selectedSeason === "Winter Collection" ? "All" : "Winter Collection"),
    },
    {
      id: "summer",
      label: "Summer Drop",
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
      isActive: selectedSeason === "Summer Collection",
      toggle: () =>
        setSelectedSeason(selectedSeason === "Summer Collection" ? "All" : "Summer Collection"),
    },
    {
      id: "instock",
      label: t("filter_in_stock_only"),
      icon: <div className="w-2 h-2 rounded-full bg-emerald-400" />,
      isActive: inStockOnly,
      toggle: () => setInStockOnly(!inStockOnly),
    },
    {
      id: "under_300",
      label: "Under ৳300",
      icon: <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />,
      isActive: priceRange[1] === 300,
      toggle: () => setPriceRange(priceRange[1] === 300 ? [0, 800] : [0, 300]),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
      {/* Page Header */}
      <div className="border-b border-[#202026] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            Gentleman Savage Curated Haute Couture
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white mt-1">
            {t("nav_shop_all")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {language === "bn"
              ? "প্রিমিয়াম লেদার, ইতালিয়ান সিল্ক এবং র স্ট্রিটওয়্যারের এক্সক্লুসিভ কালেকশন।"
              : "Discover tailored luxury outerwear, silk formalwear, and raw Japanese streetwear."}
          </p>
        </div>

        {/* Quick Search & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] w-full sm:w-60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-[#141418] border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="trending">{t("sort_trending")}</option>
              <option value="newest">{t("sort_newest")}</option>
              <option value="price-low">{t("sort_price_low")}</option>
              <option value="price-high">{t("sort_price_high")}</option>
              <option value="rating">{t("sort_rating")}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Grid Layout Switcher (Desktop) */}
          <div className="hidden sm:flex items-center rounded-xl bg-[#141418] p-1 border border-zinc-800">
            <button
              onClick={() => setGridCols("4")}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === "4" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="4 Columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols("3")}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === "3" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="3 Columns"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === "list" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Sheet Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-[#141418] border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            {t("filter_by")} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      {/* QUICK PRESETS CAROUSEL / BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 shrink-0 hidden md:inline">
          {t("filter_quick_presets")}:
        </span>
        {quickPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={preset.toggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
              preset.isActive
                ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                : "bg-[#141418] border-[#22222a] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ADVANCED ACTIVE FILTERS DASHBOARD / SYSTEM                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-2xl bg-gradient-to-b from-[#16161c] to-[#101014] border border-[#2e2e38] p-4 sm:p-5 shadow-2xl space-y-3.5 overflow-hidden"
          >
            {/* Top Row: Meta Status, Counter & Fast Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    {t("filter_active")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-black text-zinc-300 border border-zinc-700">
                    {activeFiltersCount}
                  </span>
                </div>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                  {filteredProducts.length}{" "}
                  {language === "bn" ? "টি পণ্য মেলানো হয়েছে" : "garments matched"}
                </span>
              </div>

              {/* Action Buttons: Share & Clear */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFilterLink}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
                  title="Copy shareable link with active filters"
                >
                  <Share2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>{t("filter_copy_link")}</span>
                </button>

                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t("filter_clear_all")}</span>
                </button>
              </div>
            </div>

            {/* Interactive Filter Chips Flow */}
            <div className="flex flex-wrap items-center gap-2">
              <AnimatePresence>
                {/* 1. Keyword Search Chip */}
                {searchQuery.trim().length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {t("filter_search")}: <strong className="text-white">"{searchQuery}"</strong>
                    </span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Remove search filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 2. Category Chip */}
                {selectedCategory !== "All" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-[#D4AF37]/50 text-xs text-zinc-200 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {t("filter_category")}:{" "}
                      <strong className="text-[#FAF8F5]">
                        {getCategoryDisplayName(selectedCategory, language)}
                      </strong>
                    </span>
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 3. Season Chip */}
                {selectedSeason !== "All" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                  >
                    {selectedSeason.includes("Summer") ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>
                      {t("filter_season")}: <strong className="text-white">{selectedSeason}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedSeason("All")}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Remove season filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 4. Price Max Chip */}
                {priceRange[1] < 800 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                  >
                    <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {t("filter_price_range")}:{" "}
                      <strong className="text-emerald-400">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </strong>
                    </span>
                    <button
                      onClick={() => setPriceRange([0, 800])}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Reset price filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 5. Size Chip */}
                {selectedSize && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {t("product_size")}: <strong className="text-[#D4AF37]">{selectedSize}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedSize("")}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Remove size filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 6. Color Chip with Live Hex Dot */}
                {selectedColor && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1e1e28] border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
                      style={{
                        backgroundColor:
                          ALL_COLORS.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase())
                            ?.hex || "#D4AF37",
                      }}
                    />
                    <span>
                      {t("product_color")}: <strong className="text-white">{selectedColor}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedColor("")}
                      className="p-0.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      aria-label="Remove color filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 7. In Stock Only Chip */}
                {inStockOnly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#13221a] border border-emerald-500/40 text-xs text-emerald-200 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">{t("filter_in_stock_only")}</span>
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="p-0.5 rounded-md hover:bg-emerald-900/50 text-emerald-300 hover:text-white transition-colors"
                      aria-label="Remove in stock filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 8. Flash Sale Only Chip */}
                {flashSaleOnly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 shadow-sm"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span className="font-bold">{t("filter_flash_sale_only")}</span>
                    <button
                      onClick={() => setFlashSaleOnly(false)}
                      className="p-0.5 rounded-md hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors"
                      aria-label="Remove flash sale filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}

                {/* 9. Sorting Chip (If customized) */}
                {sortBy !== "trending" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#1a1824] border border-amber-500/40 text-xs text-amber-200 shadow-sm"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {t("sort_by")}: <strong className="text-white">{getSortDisplayName(sortBy)}</strong>
                    </span>
                    <button
                      onClick={() => setSortBy("trending")}
                      className="p-0.5 rounded-md hover:bg-amber-900/50 text-amber-300 hover:text-white transition-colors"
                      aria-label="Reset sorting to trending"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout: Sidebar + Product Grid */}
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-7">
          <div className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-widest text-[#FAF8F5] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" /> {t("filter_by")}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> {t("filter_clear_all")}
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("filter_category")}
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-[#D4AF37]/15 text-[#D4AF37] font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    }`}
                  >
                    <span>{getCategoryDisplayName(cat, language)}</span>
                    {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Season Filter */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("filter_season")}
              </h4>
              <div className="space-y-1">
                {ALL_SEASONS.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedSeason.toLowerCase() === season.toLowerCase()
                        ? "bg-[#D4AF37]/15 text-[#D4AF37] font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    }`}
                  >
                    <span>{season}</span>
                    {selectedSeason.toLowerCase() === season.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold uppercase tracking-wider text-zinc-400">
                  {t("filter_max_price")}
                </h4>
                <span className="font-bold text-[#D4AF37]">{formatPrice(priceRange[1])}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#D4AF37] bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(800)}+</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("product_size")}
              </h4>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedSize === size
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-gold font-bold"
                        : "bg-[#18181f] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("product_color")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {ALL_COLORS.map((col) => (
                  <button
                    key={col.name}
                    title={col.name}
                    onClick={() => setSelectedColor(selectedColor === col.name ? "" : col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                      selectedColor === col.name
                        ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#121216] scale-110 shadow-gold"
                        : "border-white/20 hover:scale-105"
                    }`}
                  >
                    {selectedColor === col.name && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          col.name === "White" ? "text-black" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Availability Toggles */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-700 text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                />
                {t("filter_in_stock_only")}
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flashSaleOnly}
                  onChange={(e) => setFlashSaleOnly(e.target.checked)}
                  className="rounded border-zinc-700 text-rose-500 focus:ring-0 accent-rose-500"
                />
                {t("filter_flash_sale_only")}
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 space-y-6">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>
              {language === "bn" ? (
                <>
                  মোট <strong className="text-zinc-200">{filteredProducts.length}</strong> টি
                  লাক্সারি পোশাক প্রদর্শিত
                </>
              ) : (
                <>
                  Showing <strong className="text-zinc-200">{filteredProducts.length}</strong>{" "}
                  mastercrafted garments
                </>
              )}
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
                {language === "bn" ? "কালেকশন লোড হচ্ছে..." : "Curating catalog..."}
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-5 rounded-3xl bg-[#121216] border border-zinc-800 p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#181820] border border-zinc-700 flex items-center justify-center mx-auto text-[#D4AF37]">
                <Filter className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif-luxury font-bold text-white">
                  {language === "bn"
                    ? "আপনার সক্রিয় ফিল্টারের সাথে কোনো পোশাক পাওয়া যায়নি"
                    : "No garments matched your specified filters"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  {language === "bn"
                    ? "ফিল্টার পরিবর্তন করুন অথবা সব ফিল্টার মুছে সম্পূর্ণ কালেকশন দেখুন।"
                    : "Try widening your price range, searching different keywords, or resetting active criteria."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t("filter_clear_all")}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                gridCols === "4"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : gridCols === "3"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer (Full Capability) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-[#121216] border-l border-zinc-800 p-6 overflow-y-auto space-y-6 z-10 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  {t("filter_by")}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase">
                {t("filter_category")}
              </h4>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryDisplayName(c, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase">
                {t("filter_season")}
              </h4>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              >
                {ALL_SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold uppercase tracking-wider text-zinc-400">
                  {t("filter_max_price")}
                </h4>
                <span className="font-bold text-[#D4AF37]">{formatPrice(priceRange[1])}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#D4AF37] bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(800)}+</span>
              </div>
            </div>

            {/* Size */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("product_size")}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedSize === size
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] font-bold"
                        : "bg-[#18181f] text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t("product_color")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {ALL_COLORS.map((col) => (
                  <button
                    key={col.name}
                    title={col.name}
                    onClick={() => setSelectedColor(selectedColor === col.name ? "" : col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                      selectedColor === col.name
                        ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#121216] scale-110"
                        : "border-white/20"
                    }`}
                  >
                    {selectedColor === col.name && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          col.name === "White" ? "text-black" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-700 text-[#D4AF37] accent-[#D4AF37]"
                />
                {t("filter_in_stock_only")}
              </label>
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flashSaleOnly}
                  onChange={(e) => setFlashSaleOnly(e.target.checked)}
                  className="rounded border-zinc-700 text-rose-500 accent-rose-500"
                />
                {t("filter_flash_sale_only")}
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                {t("filter_clear_all")}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider shadow-gold"
              >
                {language === "bn" ? "ফলাফল দেখুন" : "Show Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
