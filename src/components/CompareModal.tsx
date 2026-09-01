"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Check, Star, ArrowRight } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function CompareModal() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
  } = useCompare();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isCompareModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden sm:p-6 md:p-10 flex justify-center items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCompareModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-5xl sm:rounded-2xl bg-[#121216] border-0 sm:border border-[#2A2A33] shadow-2xl overflow-hidden z-10 text-zinc-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#24242B] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold">Compare Luxury Garments</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Comparing {compareList.length} of 4 items side-by-side
              </p>
            </div>
            <div className="flex items-center gap-3">
              {compareList.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 pb-safe">
            {compareList.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-base text-zinc-300">No products in comparison table.</p>
                <p className="text-xs text-zinc-500">
                  Click the comparison icon on any product card to compare materials, tailoring, and prices.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
                >
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="min-w-[700px] grid grid-cols-5 gap-4">
                {/* Attribute Labels Column */}
                <div className="space-y-6 pt-52 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <div className="h-8 flex items-center border-b border-zinc-800">Price</div>
                  <div className="h-8 flex items-center border-b border-zinc-800">Category</div>
                  <div className="h-8 flex items-center border-b border-zinc-800">Season</div>
                  <div className="h-8 flex items-center border-b border-zinc-800">Rating</div>
                  <div className="h-12 flex items-center border-b border-zinc-800">Available Sizes</div>
                  <div className="h-14 flex items-center border-b border-zinc-800">Fabric & Care</div>
                  <div className="h-8 flex items-center border-b border-zinc-800">Stock Status</div>
                </div>

                {/* Product Columns */}
                {compareList.map((product) => {
                  const price = product.discountPrice ?? product.price;
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col rounded-xl bg-[#18181e] border border-zinc-800 p-4 relative group"
                    >
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-zinc-400 hover:text-rose-400 z-10"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Product Media & Title */}
                      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-900 mb-3">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>
                      <h4 className="font-semibold text-xs line-clamp-2 h-9 mb-2 text-zinc-100">
                        {product.name}
                      </h4>

                      {/* Quick Add CTA */}
                      <button
                        onClick={() => {
                          addToCart(product, product.sizes[0], product.colors[0]?.name || "Standard", 1);
                          setAddedIds((prev) => ({ ...prev, [product.id]: true }));
                          setTimeout(() => {
                            setAddedIds((prev) => ({ ...prev, [product.id]: false }));
                          }, 1500);
                        }}
                        className={`w-full py-2 mb-4 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${
                          addedIds[product.id]
                            ? "bg-emerald-500 text-white"
                            : "bg-[#D4AF37] hover:bg-[#E5C365] text-black"
                        }`}
                      >
                        {addedIds[product.id] ? (
                          <>
                            <Check className="w-3 h-3" /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" /> Add to Bag
                          </>
                        )}
                      </button>

                      {/* Attribute Values */}
                      <div className="space-y-6 text-xs text-zinc-300">
                        {/* Price */}
                        <div className="h-8 flex items-center border-b border-zinc-800 font-bold text-sm text-[#FAF8F5]">
                          {formatPrice(price)}
                          {product.discountPrice && (
                            <span className="text-zinc-500 line-through text-xs ml-1.5 font-normal">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                        {/* Category */}
                        <div className="h-8 flex items-center border-b border-zinc-800">
                          {product.category}
                        </div>

                        {/* Season */}
                        <div className="h-8 flex items-center border-b border-zinc-800 text-[#D4AF37]">
                          {product.season}
                        </div>

                        {/* Rating */}
                        <div className="h-8 flex items-center border-b border-zinc-800 gap-1 text-[#D4AF37]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-zinc-100">{product.rating}</span>
                          <span className="text-zinc-500">({product.reviewCount})</span>
                        </div>

                        {/* Sizes */}
                        <div className="h-12 flex flex-wrap items-center gap-1 border-b border-zinc-800">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Fabric & Care */}
                        <div className="h-14 flex items-center border-b border-zinc-800 text-[11px] text-zinc-400 line-clamp-2">
                          {product.fabricCare || "Handcrafted premium fabric."}
                        </div>

                        {/* Stock */}
                        <div className="h-8 flex items-center border-b border-zinc-800">
                          {product.stock > 0 ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> In Stock ({product.stock})
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
