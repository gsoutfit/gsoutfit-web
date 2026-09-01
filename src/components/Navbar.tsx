"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Shield,
  LogOut,
  ChevronDown,
  Sun,
  Snowflake,
  ArrowRight,
  Layers,
  Grid,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TranslationKey } from "@/lib/translations";
import { SearchModal } from "./SearchModal";
import { CompareModal } from "./CompareModal";
import { CartDrawer } from "./CartDrawer";
import { MobileBottomNav } from "./MobileBottomNav";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const { compareList, setIsCompareModalOpen } = useCompare();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();

  const [currentQuery, setCurrentQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);

  const categoriesMenuRef = useRef<HTMLDivElement>(null);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus and track query on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountDropdownOpen(false);
    setIsCategoriesMenuOpen(false);
    if (typeof window !== "undefined") {
      setCurrentQuery(window.location.search);
    }
  }, [pathname]);

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K for search & ESC to close dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsCategoriesMenuOpen(false);
        setIsAccountDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close categories menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
    }
    setIsCategoriesMenuOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setIsCategoriesMenuOpen(false);
    }, 200);
  };

  // Hide Navbar if on Admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // All Category Items with localized keys
  const categoriesList: {
    nameKey: TranslationKey;
    descKey: TranslationKey;
    href: string;
    icon?: React.ReactNode;
    badge?: string;
    highlight?: boolean;
  }[] = [
    {
      nameKey: "cat_all",
      descKey: "cat_desc_all",
      href: "/shop",
      icon: <Grid className="w-3.5 h-3.5 text-[#D4AF37]" />,
    },
    {
      nameKey: "cat_new_arrivals",
      descKey: "cat_desc_new_arrivals",
      href: "/shop?sort=newest",
      badge: "NEW",
    },
    {
      nameKey: "cat_tshirts",
      descKey: "cat_desc_tshirts",
      href: "/shop?category=T-Shirts",
    },
    {
      nameKey: "cat_shirts",
      descKey: "cat_desc_shirts",
      href: "/shop?category=Shirts",
    },
    {
      nameKey: "cat_pants",
      descKey: "cat_desc_pants",
      href: "/shop?category=Pants",
    },
    {
      nameKey: "cat_jeans",
      descKey: "cat_desc_jeans",
      href: "/shop?category=Jeans",
    },
    {
      nameKey: "cat_hoodies",
      descKey: "cat_desc_hoodies",
      href: "/shop?category=Hoodies",
    },
    {
      nameKey: "cat_jackets",
      descKey: "cat_desc_jackets",
      href: "/shop?category=Jackets",
    },
    {
      nameKey: "cat_accessories",
      descKey: "cat_desc_accessories",
      href: "/shop?category=Accessories",
    },
    {
      nameKey: "cat_summer",
      descKey: "cat_desc_summer",
      href: "/shop?season=Summer+Collection",
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      nameKey: "cat_winter",
      descKey: "cat_desc_winter",
      href: "/shop?season=Winter+Collection",
      icon: <Snowflake className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      nameKey: "cat_sale",
      descKey: "cat_desc_sale",
      href: "/shop?flashSale=true",
      highlight: true,
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />,
    },
  ];

  const isSummerActive = currentQuery.includes("Summer+Collection");
  const isWinterActive = currentQuery.includes("Winter+Collection");
  const isFlashActive = currentQuery.includes("flashSale=true");
  const isShopAllActive = pathname === "/shop" && !currentQuery;

  return (
    <>
      {/* 0. Top Luxury Announcement Ticker */}
      <div className="bg-[#09090b] border-b border-[#1f1f26] text-[11px] font-medium text-zinc-300 py-1.5 px-4 tracking-wider relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="hidden md:flex items-center gap-4 text-zinc-400">
            <span className="truncate">{t("nav_ticker_tagline")}</span>
            <span className="text-zinc-600 hidden lg:inline">•</span>
            <span className="text-[#D4AF37] hidden lg:inline">
              {t("nav_ticker_coupon")}
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 sm:gap-4 overflow-hidden">
            <span className="flex items-center gap-1.5 text-zinc-200 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{t("nav_ticker_delivery")}</span>
            </span>
            <div className="hidden sm:flex items-center gap-3 text-zinc-400 shrink-0">
              <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                {t("nav_concierge")}
              </Link>
              <span>•</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE-ROW LUXURY MAIN NAVBAR (z-50 to guarantee top-level layering above all page content) */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#09090b]/98 backdrop-blur-xl border-b border-[#202026] shadow-2xl"
            : "bg-[#0b0b0d] border-b border-[#1c1c22]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Toggle & Brand Logo */}
            <div className="flex items-center gap-3 lg:gap-8">
              {/* Mobile Hamburger Button */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 -ml-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Brand Logo - Gentleman Savage */}
              <Link href="/" className="group flex flex-col items-start select-none">
                <span className="font-cinzel text-lg sm:text-xl md:text-2xl font-black tracking-[0.18em] text-zinc-100 group-hover:text-[#D4AF37] transition-colors">
                  GENTLEMAN
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold tracking-[0.38em] text-[#D4AF37] uppercase -mt-1 group-hover:text-white transition-colors">
                  SAVAGE
                </span>
              </Link>

              {/* Main Desktop Navigation (Beside Logo) */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-7 ml-2">
                {/* 1. HOME */}
                <Link
                  href="/"
                  className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors py-2 relative ${
                    pathname === "/" ? "text-[#D4AF37]" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {t("nav_home")}
                  {pathname === "/" && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#D4AF37] rounded-full" />
                  )}
                </Link>

                {/* 2. SHOP ALL */}
                <Link
                  href="/shop"
                  className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors py-2 relative ${
                    isShopAllActive ? "text-[#D4AF37]" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {t("nav_shop_all")}
                  {isShopAllActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#D4AF37] rounded-full" />
                  )}
                </Link>

                {/* 3. CATEGORIES DROPDOWN TRIGGER */}
                <div
                  ref={categoriesMenuRef}
                  className="relative py-2"
                  onMouseEnter={handleCategoriesMouseEnter}
                  onMouseLeave={handleCategoriesMouseLeave}
                >
                  <button
                    onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                    className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors flex items-center gap-1 group py-1 ${
                      isCategoriesMenuOpen || (pathname?.startsWith("/categories") ?? false)
                        ? "text-[#D4AF37]"
                        : "text-zinc-300 hover:text-white"
                    }`}
                    aria-expanded={isCategoriesMenuOpen}
                    aria-haspopup="true"
                  >
                    <span>{t("nav_categories")}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-[#D4AF37] transition-transform duration-300 ${
                        isCategoriesMenuOpen ? "rotate-180 text-[#D4AF37]" : ""
                      }`}
                    />
                  </button>

                  {/* Top-level Mega Dropdown */}
                  <AnimatePresence>
                    {isCategoriesMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-0 top-full mt-1 w-[580px] bg-[#101014] border border-[#282832] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl p-5 z-[100]"
                      >
                        <div className="space-y-3">
                          {/* Dropdown Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#D4AF37]" />
                              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-200">
                                {t("nav_categories")}
                              </span>
                            </div>
                            <Link
                              href="/categories"
                              onClick={() => setIsCategoriesMenuOpen(false)}
                              className="text-[11px] font-semibold text-[#D4AF37] hover:text-[#E5C365] flex items-center gap-1 transition-colors group"
                            >
                              <span>{t("product_view_details")}</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>

                          {/* 3-Column Luxury Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {categoriesList.map((cat) => (
                              <Link
                                key={cat.nameKey}
                                href={cat.href}
                                onClick={() => setIsCategoriesMenuOpen(false)}
                                className="group/item flex flex-col p-2.5 rounded-xl bg-[#141419] hover:bg-[#1c1c24] transition-all border border-zinc-800/40 hover:border-[#D4AF37]/40 focus:outline-none focus:visible:ring-1 focus-visible:ring-[#D4AF37]"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold tracking-wide flex items-center gap-1.5 ${
                                      cat.highlight
                                        ? "text-rose-400 group-hover/item:text-rose-300"
                                        : "text-zinc-200 group-hover/item:text-[#D4AF37]"
                                    } transition-colors`}
                                  >
                                    {cat.icon}
                                    {t(cat.nameKey)}
                                  </span>
                                  {cat.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#D4AF37] text-black">
                                      {cat.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 group-hover/item:text-zinc-300">
                                  {t(cat.descKey)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. SUMMER DROP */}
                <Link
                  href="/shop?season=Summer+Collection"
                  className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors py-2 flex items-center gap-1.5 ${
                    isSummerActive ? "text-amber-400" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  {t("nav_summer_drop")}
                </Link>

                {/* 5. WINTER DROP */}
                <Link
                  href="/shop?season=Winter+Collection"
                  className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors py-2 flex items-center gap-1.5 ${
                    isWinterActive ? "text-blue-400" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                  {t("nav_winter_drop")}
                </Link>

                {/* 6. FLASH SALE */}
                <Link
                  href="/shop?flashSale=true"
                  className={`text-xs font-bold uppercase tracking-[0.14em] transition-colors py-2 flex items-center gap-1.5 ${
                    isFlashActive ? "text-rose-400" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  {t("nav_flash_sale")}
                </Link>
              </nav>
            </div>

            {/* Right: Actions (Language, Search, Wishlist, Bag, Account) */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Language Switcher in Header */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#16161c] transition-colors flex items-center gap-2 group"
                title="Search garments (Cmd+K)"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                <span className="hidden xl:inline text-xs text-zinc-400 font-medium group-hover:text-zinc-200">
                  {t("nav_search")} <kbd className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">⌘K</kbd>
                </span>
              </button>

              {/* Wishlist Button */}
              <Link
                href="/account?tab=wishlist"
                className="relative p-2 sm:p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#16161c] transition-colors hidden sm:block group"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:text-rose-400 transition-colors" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/30">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 sm:py-2 sm:px-3 rounded-xl bg-[#141418] hover:bg-[#1c1c22] border border-[#22222a] hover:border-[#D4AF37]/40 text-zinc-100 transition-all flex items-center gap-2 group"
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase text-zinc-200">
                  {t("nav_bag")}
                </span>
                {itemCount > 0 && (
                  <span className="absolute sm:relative -top-1 -right-1 sm:top-0 sm:right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-black text-[10px] font-black flex items-center justify-center shadow">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="p-2 sm:p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-[#16161c] transition-colors flex items-center gap-1"
                  aria-label="User account menu"
                >
                  <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#121216] border border-[#262630] shadow-2xl p-2 z-[100] text-xs text-zinc-200 space-y-1 animate-fade-in origin-top-right">
                    {user ? (
                      <div className="p-3 border-b border-zinc-800/80 mb-1">
                        <p className="font-bold text-white text-sm truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                          {user.role}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 border-b border-zinc-800/80 mb-1">
                        <p className="font-bold text-white">Gentleman Savage Concierge</p>
                        <p className="text-[11px] text-zinc-400">Sign in to view orders & bespoke preferences</p>
                      </div>
                    )}

                    <Link
                      href="/account"
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-800/60 transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-[#D4AF37]" /> {t("account_profile")}
                    </Link>

                    <Link
                      href="/account?tab=wishlist"
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/60 transition-colors font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-400" /> {t("account_wishlist")}
                      </span>
                      {wishlist.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-colors font-bold"
                      >
                        <Shield className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}

                    {user && (
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-950/40 text-rose-300 transition-colors font-medium text-left pt-2 border-t border-zinc-800/60 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> {t("account_sign_out")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER NAVIGATION                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Slideout Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-4/5 max-w-sm h-full bg-[#0E0E12] border-r border-[#24242B] p-6 flex flex-col justify-between overflow-y-auto z-50"
            >
              <div className="space-y-6">
                {/* Brand & Close */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex flex-col">
                    <span className="font-cinzel text-lg font-black tracking-widest text-white">
                      GENTLEMAN
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase -mt-0.5">
                      SAVAGE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Primary Nav Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block px-2 mb-1">
                    {t("nav_categories")}
                  </span>
                  <Link
                    href="/"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                      pathname === "/" ? "bg-[#D4AF37] text-black" : "text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    {t("nav_home")}
                  </Link>
                  <Link
                    href="/shop"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                      isShopAllActive ? "bg-[#D4AF37] text-black" : "text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    {t("nav_shop_all")}
                  </Link>
                  <Link
                    href="/shop?season=Summer+Collection"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-zinc-800/60"
                  >
                    <Sun className="w-4 h-4" /> {t("nav_summer_drop")}
                  </Link>
                  <Link
                    href="/shop?season=Winter+Collection"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-blue-400 hover:bg-zinc-800/60"
                  >
                    <Snowflake className="w-4 h-4" /> {t("nav_winter_drop")}
                  </Link>
                  <Link
                    href="/shop?flashSale=true"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-zinc-800/60"
                  >
                    <Flame className="w-4 h-4" /> {t("nav_flash_sale")}
                  </Link>
                </div>

                {/* Categories Catalog */}
                <div className="space-y-1 pt-3 border-t border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block px-2 mb-1">
                    {t("nav_categories")}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categoriesList.map((item) => (
                      <Link
                        key={item.nameKey}
                        href={item.href}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          item.highlight
                            ? "text-rose-400 font-bold"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                        }`}
                      >
                        {item.icon}
                        <span>{t(item.nameKey)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Drawer Bottom */}
              <div className="pt-6 border-t border-zinc-800 space-y-2">
                <Link
                  href="/categories"
                  className="w-full py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-center block text-xs font-bold uppercase tracking-wider text-[#D4AF37]"
                >
                  {t("product_view_details")}
                </Link>
                <Link
                  href="/account"
                  className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center block text-xs font-bold uppercase tracking-wider text-zinc-300"
                >
                  {t("nav_account")} / {t("nav_concierge")}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CompareModal />
      <CartDrawer />
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
    </>
  );
}
