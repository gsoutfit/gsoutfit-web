"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, ShoppingBag, Star, Sparkles, Flame, Check } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/translations";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { t, language, getLocalizedText } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || "Standard");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const isLowStock = product.stock > 0 && product.stock <= 15;
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsQuickAddOpen(false);
    }, 800);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const primaryImage =
    product.images[0] ||
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80";
  const hoverImage = product.images[1] || primaryImage;

  const displayName = getLocalizedText(product.name, product.nameBn);
  const displayCategory = getCategoryDisplayName(product.category, language);

  return (
    <>
      <div
        className="group relative flex flex-col rounded-2xl bg-[#141417] border border-[#24242B] overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-black/70"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsQuickAddOpen(false);
        }}
      >
        {/* Media Image Container */}
        <Link
          href={`/product/${product.id}`}
          className="relative block aspect-[3/4] w-full overflow-hidden bg-[#0e0e11]"
        >
          <Image
            src={isHovered ? hoverImage : primaryImage}
            alt={displayName}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {product.isFlashSale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-500/90 text-white backdrop-blur-md shadow-lg shadow-red-500/20">
                <Flame className="w-3 h-3 animate-bounce" /> {t("nav_flash_sale")}
              </span>
            )}
            {product.isTrending && !product.isFlashSale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#D4AF37] text-black backdrop-blur-md shadow-lg shadow-[#D4AF37]/20">
                <Sparkles className="w-3 h-3" /> {t("sort_trending")}
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-zinc-900/90 text-zinc-200 border border-zinc-700/60 backdrop-blur-md">
                {t("cat_new_arrivals")}
              </span>
            )}
            {isLowStock && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                {product.stock} {t("product_pieces_available")}
              </span>
            )}
          </div>

          {/* Wishlist & Quick View Floating Buttons */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              onClick={handleWishlistClick}
              aria-label="Toggle Wishlist"
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                isWishlisted
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleQuickViewClick}
              title={t("product_quick_view")}
              aria-label={t("product_quick_view")}
              className="p-2.5 rounded-full backdrop-blur-md bg-black/60 text-zinc-300 hover:text-[#D4AF37] hover:bg-black/90 transition-all duration-200 opacity-0 group-hover:opacity-100 max-sm:opacity-100 shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300">
            {!isQuickAddOpen ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickAddOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-black/85 hover:bg-[#D4AF37] text-white hover:text-black font-semibold text-xs tracking-wider uppercase backdrop-blur-md border border-white/10 hover:border-[#D4AF37] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 max-sm:opacity-100 max-sm:translate-y-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> {t("product_add_to_cart")}
              </button>
            ) : (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-3 rounded-xl bg-[#121215]/95 border border-[#D4AF37]/50 backdrop-blur-xl shadow-2xl space-y-2 animate-fade-in max-h-[200px] overflow-y-auto"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{t("product_select_size")}:</span>
                  <span className="font-semibold text-[#D4AF37]">{selectedSize}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-all ${
                        selectedSize === s
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] font-bold"
                          : "bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className={`w-full py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                    isAdded
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : "bg-[#D4AF37] hover:bg-[#E5C365] text-black shadow-[#D4AF37]/20"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> {t("product_add_to_cart")}!
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> {t("product_add_to_cart")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </Link>

        {/* Content Info */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
          <div>
            {/* Category & Season */}
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-400 font-medium mb-1">
              <span>{displayCategory}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-[#D4AF37]/80">{product.season}</span>
            </div>

            {/* Title */}
            <Link
              href={`/product/${product.id}`}
              className="block group-hover:text-[#D4AF37] transition-colors"
            >
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base leading-snug line-clamp-1">
                {displayName}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center text-[#D4AF37]">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Color Swatches & Price */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
            {/* Colors */}
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((col) => (
                <span
                  key={col.name}
                  title={col.name}
                  style={{ backgroundColor: col.hex }}
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[10px] text-zinc-500">+{product.colors.length - 3}</span>
              )}
            </div>

            {/* Price Display */}
            <div className="text-right">
              {hasDiscount ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-zinc-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm md:text-base font-bold text-[#FAF8F5]">
                    {formatPrice(product.discountPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-sm md:text-base font-bold text-[#FAF8F5]">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}
