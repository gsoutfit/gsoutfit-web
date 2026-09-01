"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Heart,
  Star,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/translations";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { t, getLocalizedText, language } = useLanguage();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || "");
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0]?.name || "Standard");
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isWishlisted = isInWishlist(product.id);
  const price = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const currentStockForSize = product.stockPerSize?.[selectedSize] ?? product.stock;

  const displayName = getLocalizedText(product.name, product.nameBn);
  const displayDesc = getLocalizedText(product.description, product.descriptionBn);
  const displayCategory = getCategoryDisplayName(product.category, language);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    showToast(
      t("product_add_to_cart"),
      `${displayName} (${selectedSize} / ${selectedColor}) ${t("product_add_to_cart")}.`,
      "success"
    );
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setIsCartDrawerOpen(true);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-4xl bg-[#0f0f13] border border-[#262633] rounded-3xl overflow-hidden shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-black transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
            {/* Media Gallery (Left) */}
            <div className="p-6 bg-[#0a0a0d] flex flex-col gap-4">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <Image
                  src={selectedImage}
                  alt={displayName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.isFlashSale && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500 text-white">
                      <Flame className="w-3 h-3" /> {t("nav_flash_sale")}
                    </span>
                  )}
                  {product.isTrending && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#D4AF37] text-black">
                      <Sparkles className="w-3 h-3" /> {t("sort_trending")}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImage === img
                          ? "border-[#D4AF37] opacity-100 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details (Right) */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  <span>{displayCategory}</span>
                  <span className="text-[#D4AF37]">{product.season}</span>
                </div>

                {/* Title */}
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-black text-white leading-tight">
                  {displayName}
                </h2>

                {/* Ratings */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#D4AF37]">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">({product.reviewCount} {t("product_reviews")})</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {formatPrice(price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-zinc-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {currentStockForSize > 0 && currentStockForSize <= 10 && (
                    <span className="text-xs font-semibold text-amber-400">
                      • {currentStockForSize} {t("product_pieces_available")}
                    </span>
                  )}
                </div>

                {/* Description Snippet */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                  {displayDesc}
                </p>

                {/* Color Selection */}
                {product.colors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-400 uppercase tracking-wider">{t("product_color")}</span>
                      <span className="text-white font-bold">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            selectedColor === c.name
                              ? "border-[#D4AF37] bg-[#D4AF37]/10 text-white"
                              : "border-zinc-800 bg-[#16161c] text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-400 uppercase tracking-wider">{t("product_select_size")}</span>
                      <span className="text-[#D4AF37] font-bold">{selectedSize}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {product.sizes.map((sz) => {
                        const stockVal = product.stockPerSize?.[sz] ?? 10;
                        const isOutOfStock = stockVal <= 0;
                        return (
                          <button
                            key={sz}
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSize(sz)}
                            className={`py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                              selectedSize === sz
                                ? "bg-[#D4AF37] text-black shadow-gold"
                                : isOutOfStock
                                ? "bg-zinc-900/50 text-zinc-600 border border-zinc-800/50 cursor-not-allowed line-through"
                                : "bg-[#181820] text-zinc-300 border border-zinc-800 hover:border-zinc-600 hover:text-white"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">
                    {t("product_quantity")}
                  </span>
                  <div className="flex items-center rounded-xl bg-[#181820] border border-zinc-800 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStockForSize, quantity + 1))}
                      disabled={quantity >= currentStockForSize}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStockForSize <= 0 || isAdded}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> {t("product_add_to_cart")}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> {t("product_add_to_cart")} • {formatPrice(price * quantity)}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWishlisted
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-[#181820] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                    }`}
                    aria-label={t("nav_wishlist")}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-400 hover:text-[#D4AF37] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {t("product_view_details")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-zinc-400 uppercase font-semibold text-center border-t border-zinc-900">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>VIP Express</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Authenticity</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>30-Day Exchange</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
