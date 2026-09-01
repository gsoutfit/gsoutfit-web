"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  const { t, getLocalizedText, language } = useLanguage();

  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
    setCouponInput("");
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-screen max-w-[100vw] sm:max-w-md bg-[#0f0f12] border-l border-[#24242B] flex flex-col shadow-2xl text-zinc-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#24242B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="font-serif-luxury text-lg font-bold tracking-wide">
                    {t("cart_title")}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#202026] text-[#D4AF37]">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1a20] transition-colors"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="p-4 bg-[#141418] border-b border-[#24242B]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    {freeShippingRemaining === 0 ? (
                      <span className="text-[#D4AF37] font-bold">
                        {t("cart_free_delivery_unlocked")}
                      </span>
                    ) : (
                      <span>
                        {language === "bn"
                          ? `ফ্রি ডেলিভারির জন্য আরও ${formatPrice(freeShippingRemaining)} যোগ করুন`
                          : `Add ${formatPrice(freeShippingRemaining)} more for FREE VIP Delivery`}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">
                    {freeShippingProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-zinc-800/80">
                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-zinc-200">
                        {t("cart_empty")}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                        {t("cart_empty_desc")}
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold"
                    >
                      {t("cart_continue_shopping")}
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.product.discountPrice ?? item.product.price;
                    const displayName = getLocalizedText(item.product.name, item.product.nameBn);

                    return (
                      <div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="pt-4 first:pt-0 flex gap-4 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                          <Image
                            src={item.product.images[0]}
                            alt={displayName}
                            fill
                            sizes="80px"
                            className="object-cover object-center"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <Link
                                href={`/product/${item.productId}`}
                                onClick={() => setIsCartDrawerOpen(false)}
                                className="font-medium text-sm text-zinc-200 hover:text-[#D4AF37] transition-colors line-clamp-1"
                              >
                                {displayName}
                              </Link>
                              <button
                                onClick={() => removeFromCart(item.productId, item.size, item.color)}
                                className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                                aria-label={t("cart_remove")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {t("product_size")}: <span className="text-zinc-200">{item.size}</span> • {t("product_color")}:{" "}
                              <span className="text-zinc-200">{item.color}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Modifier */}
                            <div className="flex items-center rounded-lg border border-zinc-800 bg-[#16161c]">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                                }
                                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-zinc-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                                }
                                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Item Total */}
                            <span className="font-semibold text-sm text-[#FAF8F5]">
                              {formatPrice(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Checkout Summary */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-[#24242B] bg-[#121216] space-y-4">
                  {/* Coupon Code Input */}
                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder={t("checkout_voucher_ph")}
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-[#1a1a20] border border-zinc-700/80 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplying || !couponInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-200 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {t("checkout_apply")}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-bold text-[#D4AF37]">{appliedCoupon.code}</span>
                        <span className="text-zinc-400">(-{formatPrice(discountAmount)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-zinc-400 hover:text-rose-400 font-semibold"
                      >
                        {t("cart_remove")}
                      </button>
                    </div>
                  )}

                  {/* Subtotal Breakdown */}
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>{t("cart_subtotal")}</span>
                      <span className="font-medium text-zinc-200">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>{t("product_discount")}</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t("checkout_shipping_fee")}</span>
                      <span className="font-medium text-zinc-200">
                        {shippingFee === 0 ? (
                          <span className="text-[#D4AF37] font-bold">{t("checkout_free")}</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                      <span>{t("checkout_total")}</span>
                      <span className="text-[#D4AF37] text-base">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-gold group"
                  >
                    <span>{t("cart_checkout_btn")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <p className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t("cart_shipping_note")}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
