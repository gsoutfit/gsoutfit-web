"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  "Leather Biker Jacket",
  "Cashmere Knit",
  "Japanese Selvedge Denim",
  "Silk Tuxedo Blazer",
  "Summer Resort Shirts",
  "Pleated Trousers",
  "Heavyweight Hoodie",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-0 sm:p-6 md:p-20 flex justify-center items-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full min-h-[100dvh] sm:min-h-0 sm:h-auto max-w-3xl sm:rounded-2xl bg-[#121215] border-0 sm:border border-[#2A2A33] shadow-2xl overflow-hidden z-10 text-zinc-100 flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="relative border-b border-[#24242B] p-4 flex items-center gap-3 pt-safe">
              <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search garments, categories..."
                className="w-full bg-transparent text-base md:text-lg text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              {isLoading && <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin shrink-0" />}
              {query && !isLoading && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Results or Trending Content */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {query.trim() === "" ? (
                <div className="space-y-6">
                  {/* Trending Queries */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-zinc-400 mb-3">
                      <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Trending Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 rounded-xl bg-[#1a1a20] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/50 text-zinc-300 hover:text-[#D4AF37] text-xs border border-zinc-800 transition-all flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seasonal Shortcuts */}
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-3">
                      Explore By Season
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        href="/shop?season=Summer+Collection"
                        onClick={onClose}
                        className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-zinc-900 border border-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-sm text-amber-200">Summer Collection</p>
                          <p className="text-xs text-zinc-400">Linens, Silk Camp Collars, Light Chinos</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href="/shop?season=Winter+Collection"
                        onClick={onClose}
                        className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-zinc-900 border border-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-sm text-blue-200">Winter Collection</p>
                          <p className="text-xs text-zinc-400">Cashmere, Leather Outerwear, Overcoats</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : results.length === 0 && !isLoading ? (
                <div className="text-center py-12 text-zinc-400 space-y-2">
                  <p className="text-sm font-semibold">No garments found for &quot;{query}&quot;</p>
                  <p className="text-xs text-zinc-500">
                    Try searching for &quot;Jacket&quot;, &quot;Shirt&quot;, &quot;Wool&quot;, or &quot;Hoodie&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {results.length} Garments Found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.map((product) => {
                      const price = product.discountPrice ?? product.price;
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#18181d] hover:bg-[#202027] border border-zinc-800 hover:border-[#D4AF37]/50 transition-all group"
                        >
                          <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover object-center group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                              {product.category} • {product.season}
                            </p>
                            <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-[#D4AF37] transition-colors truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs font-bold text-zinc-100 mt-0.5">
                              {formatPrice(price)}
                              {product.discountPrice && (
                                <span className="text-zinc-500 line-through ml-1.5 text-[11px]">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#24242B] bg-[#0d0d10] flex justify-between items-center text-xs text-zinc-500">
              <span>Press <strong className="text-zinc-300">ESC</strong> to exit</span>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
              >
                Explore Full Catalog <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
