"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  const { t, getLocalizedText, language } = useLanguage();

  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCode.trim());
    setIsApplyingCoupon(false);
    setCouponCode("");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#18181f] border border-zinc-800 flex items-center justify-center mx-auto text-[#D4AF37]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">
            {t("cart_empty")}
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {t("cart_empty_desc")}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-widest transition-colors shadow-gold"
        >
          {t("cart_continue_shopping")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#202026] pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <ShoppingBag className="w-3.5 h-3.5" />
            Gentleman Savage
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-black text-white mt-1">
            {t("cart_title")} ({cart.reduce((s, i) => s + i.quantity, 0)} {t("product_quantity")})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" /> {t("filter_clear_all")}
        </button>
      </div>

      {/* Free Shipping Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#24242B] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center gap-2 font-semibold text-zinc-200">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            {freeShippingRemaining === 0 ? (
              <span className="text-[#D4AF37] font-bold">
                {t("cart_free_delivery_unlocked")}
              </span>
            ) : (
              <span>
                {language === "bn"
                  ? `ফ্রি ডেলিভারির জন্য আরও ${formatPrice(freeShippingRemaining)} যোগ করুন`
                  : `Add ${formatPrice(freeShippingRemaining)} more to unlock COMPLIMENTARY Express Shipping`}
              </span>
            )}
          </span>
          <span className="text-zinc-400 font-mono font-bold">
            {freeShippingProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cart Items (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden p-6 sm:p-8">
            <div className="hidden sm:grid grid-cols-12 text-xs font-bold uppercase tracking-widest text-zinc-500 pb-4 border-b border-zinc-800">
              <span className="col-span-6">{t("nav_shop")}</span>
              <span className="col-span-2 text-center">{t("product_price")}</span>
              <span className="col-span-2 text-center">{t("product_quantity")}</span>
              <span className="col-span-2 text-right">{t("checkout_total")}</span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {cart.map((item) => {
                const price = item.product.discountPrice ?? item.product.price;
                const displayName = getLocalizedText(item.product.name, item.product.nameBn);

                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="py-6 first:pt-4 flex flex-col sm:grid sm:grid-cols-12 items-center gap-4"
                  >
                    {/* Item Details */}
                    <div className="w-full sm:col-span-6 flex items-center gap-4">
                      <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                        <Image
                          src={item.product.images[0]}
                          alt={displayName}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-bold text-sm text-zinc-100 hover:text-[#D4AF37] transition-colors line-clamp-1"
                        >
                          {displayName}
                        </Link>
                        <p className="text-xs text-zinc-400">
                          {t("product_size")}: <span className="text-zinc-200 font-semibold">{item.size}</span> • {t("product_color")}:{" "}
                          <span className="text-zinc-200 font-semibold">{item.color}</span>
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 pt-1"
                        >
                          <Trash2 className="w-3 h-3" /> {t("cart_remove")}
                        </button>
                      </div>
                    </div>

                    {/* Stepper and Prices Wrapper */}
                    <div className="sm:contents flex w-full justify-between items-center mt-2 sm:mt-0">
                      {/* Unit Price */}
                      <div className="hidden sm:block sm:col-span-2 text-center text-xs font-semibold text-zinc-300">
                        {formatPrice(price)}
                      </div>

                      {/* Stepper */}
                      <div className="sm:col-span-2 flex justify-center">
                        <div className="flex items-center rounded-xl border border-zinc-800 bg-[#18181f] px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                            }
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                            }
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="sm:col-span-2 text-right font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(price * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-2xl">
            <h3 className="font-serif-luxury text-lg font-bold text-white border-b border-zinc-800 pb-3">
              {t("checkout_summary_title")}
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {t("checkout_voucher")}
              </label>
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder={t("checkout_voucher_ph")}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#18181f] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-200 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {t("checkout_apply")}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-[#D4AF37]">{appliedCoupon.code}</span>
                    <span className="text-zinc-400">(-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-zinc-400 hover:text-rose-400 underline"
                  >
                    {t("cart_remove")}
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
              <div className="flex justify-between">
                <span>{t("checkout_subtotal")}</span>
                <span className="text-zinc-200">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>{t("product_discount")}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t("checkout_shipping_fee")}</span>
                <span className="text-zinc-200">
                  {shippingFee === 0 ? (
                    <span className="text-[#D4AF37] font-bold">{t("checkout_free")}</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("checkout_tax")}</span>
                <span className="text-zinc-200">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-zinc-800">
                <span>{t("checkout_total")}</span>
                <span className="text-[#D4AF37]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#D4AF37] to-[#A98725] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 shadow-gold-lg"
            >
              <Lock className="w-4 h-4" /> {t("cart_checkout_btn")} <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Verified Gentleman Savage VIP Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t("footer_exchange_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
