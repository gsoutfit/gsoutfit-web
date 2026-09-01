"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Loader2,
  Check,
  Copy,
  Banknote,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { PaymentMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    discountAmount,
    tax,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { t, getLocalizedText, language } = useLanguage();

  // Form State - populated dynamically if customer is logged in
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [state, setState] = useState("Dhaka");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Bangladesh");

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<{
    id: string;
    name: string;
    price: number;
    time: string;
  }>({
    id: "express",
    name: "Complimentary VIP Express Courier",
    price: 0,
    time: "2-3 Business Days",
  });

  // Payment Method State: ONLY Cash on Delivery, bKash, and Nagad
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // bKash Fields
  const [bkashSenderNumber, setBkashSenderNumber] = useState("");
  const [bkashTrxId, setBkashTrxId] = useState("");

  // Nagad Fields
  const [nagadSenderNumber, setNagadSenderNumber] = useState("");
  const [nagadTrxId, setNagadTrxId] = useState("");

  // UI state
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const BKASH_ACCOUNT_NUMBER = "01700-123456";
  const NAGAD_ACCOUNT_NUMBER = "01800-123456";

  // Order Placement State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{
    orderNumber: string;
    trackingNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
    trxId?: string;
    senderNumber?: string;
  } | null>(null);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#18181f] border border-zinc-800 flex items-center justify-center mx-auto text-[#D4AF37]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
          {t("cart_empty")}
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          {t("cart_empty_desc")}
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-gold"
        >
          {t("cart_continue_shopping")}
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for bKash
    if (paymentMethod === "bkash") {
      if (!bkashSenderNumber.trim()) {
        setErrorMessage("Please enter your bKash mobile number.");
        return;
      }
      if (!bkashTrxId.trim() || bkashTrxId.trim().length < 6) {
        setErrorMessage("Please enter a valid bKash Transaction ID (TrxID).");
        return;
      }
    }

    // Validation for Nagad
    if (paymentMethod === "nagad") {
      if (!nagadSenderNumber.trim()) {
        setErrorMessage("Please enter your Nagad mobile number.");
        return;
      }
      if (!nagadTrxId.trim() || nagadTrxId.trim().length < 6) {
        setErrorMessage("Please enter a valid Nagad Transaction ID (TrxID).");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const paymentDetails =
        paymentMethod === "bkash"
          ? {
              senderNumber: bkashSenderNumber.trim(),
              transactionId: bkashTrxId.trim().toUpperCase(),
              paymentNumber: BKASH_ACCOUNT_NUMBER,
            }
          : paymentMethod === "nagad"
          ? {
              senderNumber: nagadSenderNumber.trim(),
              transactionId: nagadTrxId.trim().toUpperCase(),
              paymentNumber: NAGAD_ACCOUNT_NUMBER,
            }
          : undefined;

      const payload = {
        userId: user?.id || "guest",
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
        },
        shippingAddress: {
          street,
          city,
          state,
          zip,
          country,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code,
        shippingFee: shippingMethod.price,
        shippingMethod: shippingMethod.name,
        paymentMethod,
        paymentDetails,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setOrderPlaced({
          orderNumber: data.data.orderNumber,
          trackingNumber: data.data.trackingNumber,
          total: data.data.total,
          paymentMethod,
          trxId: paymentDetails?.transactionId,
          senderNumber: paymentDetails?.senderNumber,
        });

        // Trigger celebratory confetti on client
        if (typeof window !== "undefined") {
          import("canvas-confetti")
            .then((m) => {
              const confetti = m.default;
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#D4AF37", "#FFFFFF", "#E5C365", "#0B0B0C"],
              });
            })
            .catch(() => {});
        }

        clearCart();
      } else {
        setErrorMessage(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If order was successfully placed:
  if (orderPlaced) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] shadow-gold-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#18181f] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" /> {t("order_success_badge")}
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white">
            {t("order_success_title")}
          </h1>
          <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
            {t("order_success_desc")}
          </p>
        </div>

        {/* Order Card */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] text-left max-w-lg mx-auto space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 text-xs">
            <span className="text-zinc-400">{t("order_number")}:</span>
            <span className="font-bold text-[#D4AF37] font-mono text-sm">{orderPlaced.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 text-xs">
            <span className="text-zinc-400">{t("order_tracking_number")}:</span>
            <span className="font-semibold text-zinc-200 font-mono">{orderPlaced.trackingNumber}</span>
          </div>

          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 text-xs">
            <span className="text-zinc-400">{t("order_payment_type")}:</span>
            <span className="font-semibold text-zinc-200 capitalize">
              {orderPlaced.paymentMethod === "cod"
                ? t("checkout_cod_title")
                : orderPlaced.paymentMethod === "bkash"
                ? t("checkout_bkash_title")
                : t("checkout_nagad_title")}
            </span>
          </div>

          {orderPlaced.trxId && (
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 text-xs">
              <span className="text-zinc-400">{t("checkout_trxid")}:</span>
              <span className="font-mono font-bold text-[#D4AF37]">{orderPlaced.trxId}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
            <span>{t("checkout_total")}:</span>
            <span className="text-[#D4AF37]">{formatPrice(orderPlaced.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/account"
            className="px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold"
          >
            {t("order_track_btn")}
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            {t("order_continue_btn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#202026] pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <Lock className="w-3.5 h-3.5" />
            256-Bit Encrypted Secure Portal
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-black text-white mt-1">
            {t("checkout_title")}
          </h1>
        </div>

        <Link
          href="/cart"
          className="text-xs font-semibold text-zinc-400 hover:text-[#D4AF37] flex items-center gap-1"
        >
          <ShoppingBag className="w-4 h-4" /> {t("cart_view_bag")}
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 Cols: Form Sections */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact Information */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center">
                1
              </span>
              {t("checkout_contact")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_full_name")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout_full_name_ph")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_phone")}</label>
                <input
                  type="tel"
                  required
                  placeholder={t("checkout_phone_ph")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_email")}</label>
                <input
                  type="email"
                  required
                  placeholder={t("checkout_email_ph")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center">
                2
              </span>
              {t("checkout_address")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_street")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout_street_ph")}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_city")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout_city_ph")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_state")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout_state_ph")}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">{t("checkout_zip")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout_zip_ph")}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Delivery Method */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center">
                3
              </span>
              {t("checkout_shipping_fee")}
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: "express",
                  name: "Complimentary VIP Express Courier",
                  price: 0,
                  time: "2-3 Business Days (Doorstep Delivery)",
                },
              ].map((option) => (
                <label
                  key={option.id}
                  onClick={() => setShippingMethod(option)}
                  className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer bg-[#D4AF37]/10 border-[#D4AF37]"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod.id === option.id}
                      onChange={() => setShippingMethod(option)}
                      className="accent-[#D4AF37]"
                    />
                    <div>
                      <p className="font-bold text-xs text-white">{option.name}</p>
                      <p className="text-[11px] text-zinc-400">{option.time}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-[#FAF8F5]">
                    {t("checkout_free")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Payment Method UI (ONLY Cash on Delivery, bKash, and Nagad) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center">
                  4
                </span>
                {t("checkout_payment_method")}
              </h3>
              <span className="text-[11px] font-semibold text-zinc-400">
                Official BD Payment Options
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cod");
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === "cod"
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-gold"
                    : "bg-[#18181f] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-black/40 text-[#D4AF37]">
                    <Banknote className="w-5 h-5" />
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-xs text-white">{t("checkout_cod_title")}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{t("checkout_cod_subtitle")}</p>
              </button>

              {/* bKash */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("bkash");
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === "bkash"
                    ? "bg-[#E2136E]/15 border-[#E2136E] text-white shadow-[0_0_20px_rgba(226,19,110,0.2)]"
                    : "bg-[#18181f] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="px-2.5 py-1 rounded-xl bg-[#E2136E] text-white font-extrabold text-xs tracking-wider">
                    bKash
                  </div>
                  {paymentMethod === "bkash" && (
                    <div className="w-5 h-5 rounded-full bg-[#E2136E] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-xs text-white">{t("checkout_bkash_title")}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Send Money / Merchant Payment</p>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("nagad");
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === "nagad"
                    ? "bg-[#F7931E]/15 border-[#F7931E] text-white shadow-[0_0_20px_rgba(247,147,30,0.2)]"
                    : "bg-[#18181f] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="px-2.5 py-1 rounded-xl bg-[#F7931E] text-white font-extrabold text-xs tracking-wider">
                    NAGAD
                  </div>
                  {paymentMethod === "nagad" && (
                    <div className="w-5 h-5 rounded-full bg-[#F7931E] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-xs text-white">{t("checkout_nagad_title")}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Send Money / Merchant Payment</p>
              </button>
            </div>

            {/* 1. Cash on Delivery Instructions */}
            {paymentMethod === "cod" && (
              <div className="p-5 rounded-2xl bg-[#16161c] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{t("checkout_cod_title")}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {t("checkout_cod_subtitle")}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>{t("checkout_total")}:</span>
                  <span className="text-[#D4AF37] font-bold text-sm">
                    {formatPrice(total + shippingMethod.price)}
                  </span>
                </div>
              </div>
            )}

            {/* 2. bKash Instructions & Input Panel */}
            {paymentMethod === "bkash" && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#170e13] border border-[#E2136E]/40 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2136E]/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#E2136E] text-white font-black text-xs">
                        bKash
                      </span>
                      <h4 className="font-bold text-white text-sm">{t("checkout_bkash_title")}</h4>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">
                      {language === "bn" ? "আমাদের অফিশিয়াল বিকাশ নম্বরে টাকা পাঠান:" : "Send payment to our official merchant account:"}
                    </p>
                  </div>

                  {/* Copyable bKash Number */}
                  <div className="flex items-center gap-2 bg-[#0c070a] border border-[#E2136E]/50 px-3.5 py-2 rounded-xl shrink-0">
                    <span className="font-mono font-black text-white text-sm tracking-wider">
                      {BKASH_ACCOUNT_NUMBER}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(BKASH_ACCOUNT_NUMBER)}
                      className="p-1.5 rounded-lg bg-[#E2136E]/20 hover:bg-[#E2136E] text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                      title={t("checkout_copy_number")}
                    >
                      {copiedNumber === BKASH_ACCOUNT_NUMBER ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> {t("checkout_copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> {t("checkout_copy_number")}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-[#0e0a0d] p-4 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
                  <p className="font-bold text-zinc-100 uppercase tracking-wider text-[10px] text-[#ff4b94]">
                    {language === "bn" ? "পেমেন্ট নির্দেশিকা:" : "Payment Instructions:"}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                    <li>{language === "bn" ? "বিকাশ অ্যাপ খুলুন বা ডায়াল করুন" : "Open your bKash app or dial"} <code className="text-white bg-black/50 px-1 py-0.5 rounded">*247#</code></li>
                    <li>{language === "bn" ? "Send Money / Payment নির্বাচন করে নম্বর দিন:" : "Choose Send Money / Payment to"} <code className="text-[#ff4b94] font-mono font-bold">{BKASH_ACCOUNT_NUMBER}</code></li>
                    <li>{language === "bn" ? "টাকার পরিমাণ লিখুন:" : "Enter Amount:"} <strong className="text-white font-bold">{formatPrice(total + shippingMethod.price)}</strong></li>
                    <li>{language === "bn" ? "রেফারেন্সে লিখুন:" : "Enter Reference:"} <strong className="text-white">GS</strong></li>
                    <li>{language === "bn" ? "পিন দিয়ে পেমেন্ট নিশ্চিত করুন এবং প্রাপ্ত TrxID নিচে লিখুন" : "Confirm with PIN and enter Transaction ID (TrxID) below"}</li>
                  </ol>
                </div>

                {/* bKash Input Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      {t("checkout_sender_number")} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t("checkout_sender_number_ph")}
                      value={bkashSenderNumber}
                      onChange={(e) => setBkashSenderNumber(e.target.value)}
                      className="w-full p-3 bg-[#0d070b] border border-zinc-800 focus:border-[#E2136E] rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      {t("checkout_trxid")} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("checkout_trxid_ph")}
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value.toUpperCase())}
                      className="w-full p-3 bg-[#0d070b] border border-zinc-800 focus:border-[#E2136E] rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-600 uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Nagad Instructions & Input Panel */}
            {paymentMethod === "nagad" && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#17120e] border border-[#F7931E]/40 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F7931E]/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#F7931E] text-white font-black text-xs">
                        NAGAD
                      </span>
                      <h4 className="font-bold text-white text-sm">{t("checkout_nagad_title")}</h4>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">
                      {language === "bn" ? "আমাদের অফিশিয়াল নগদ নম্বরে টাকা পাঠান:" : "Send payment to our official merchant account:"}
                    </p>
                  </div>

                  {/* Copyable Nagad Number */}
                  <div className="flex items-center gap-2 bg-[#0c0907] border border-[#F7931E]/50 px-3.5 py-2 rounded-xl shrink-0">
                    <span className="font-mono font-black text-white text-sm tracking-wider">
                      {NAGAD_ACCOUNT_NUMBER}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(NAGAD_ACCOUNT_NUMBER)}
                      className="p-1.5 rounded-lg bg-[#F7931E]/20 hover:bg-[#F7931E] text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                      title={t("checkout_copy_number")}
                    >
                      {copiedNumber === NAGAD_ACCOUNT_NUMBER ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> {t("checkout_copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> {t("checkout_copy_number")}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-[#0e0b08] p-4 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
                  <p className="font-bold text-zinc-100 uppercase tracking-wider text-[10px] text-[#fca338]">
                    {language === "bn" ? "পেমেন্ট নির্দেশিকা:" : "Payment Instructions:"}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                    <li>{language === "bn" ? "নগদ অ্যাপ খুলুন বা ডায়াল করুন" : "Open your Nagad app or dial"} <code className="text-white bg-black/50 px-1 py-0.5 rounded">*167#</code></li>
                    <li>{language === "bn" ? "Send Money / Payment নির্বাচন করে নম্বর দিন:" : "Choose Send Money / Payment to"} <code className="text-[#fca338] font-mono font-bold">{NAGAD_ACCOUNT_NUMBER}</code></li>
                    <li>{language === "bn" ? "টাকার পরিমাণ লিখুন:" : "Enter Amount:"} <strong className="text-white font-bold">{formatPrice(total + shippingMethod.price)}</strong></li>
                    <li>{language === "bn" ? "রেফারেন্সে লিখুন:" : "Enter Reference:"} <strong className="text-white">GS</strong></li>
                    <li>{language === "bn" ? "পিন দিয়ে পেমেন্ট নিশ্চিত করুন এবং প্রাপ্ত TrxID নিচে লিখুন" : "Confirm with PIN and enter Transaction ID (TrxID) below"}</li>
                  </ol>
                </div>

                {/* Nagad Input Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      {t("checkout_sender_number")} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t("checkout_sender_number_ph")}
                      value={nagadSenderNumber}
                      onChange={(e) => setNagadSenderNumber(e.target.value)}
                      className="w-full p-3 bg-[#0d0907] border border-zinc-800 focus:border-[#F7931E] rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      {t("checkout_trxid")} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("checkout_trxid_ph")}
                      value={nagadTrxId}
                      onChange={(e) => setNagadTrxId(e.target.value.toUpperCase())}
                      className="w-full p-3 bg-[#0d0907] border border-zinc-800 focus:border-[#F7931E] rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-600 uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 lg:sticky lg:top-28 shadow-2xl">
            <h3 className="font-serif-luxury text-lg font-bold text-white border-b border-zinc-800 pb-3">
              {t("checkout_summary_title")} ({cart.length})
            </h3>

            {/* Line Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-zinc-800/80">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-white truncate">
                      {getLocalizedText(item.product.name, item.product.nameBn)}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {t("product_quantity")}: {item.quantity} • {item.size} • {item.color}
                    </p>
                  </div>
                  <div className="text-right text-xs font-bold text-white">
                    {formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
              <div className="flex justify-between">
                <span>{t("checkout_subtotal")}</span>
                <span className="text-zinc-200">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>{t("checkout_voucher")}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t("checkout_shipping_fee")}</span>
                <span className="text-zinc-200">
                  {shippingMethod.price === 0 ? (
                    <span className="text-[#D4AF37] font-bold">{t("checkout_free")}</span>
                  ) : (
                    formatPrice(shippingMethod.price)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("checkout_tax")}</span>
                <span className="text-zinc-200">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-zinc-800">
                <span>{t("checkout_total")}</span>
                <span className="text-[#D4AF37]">{formatPrice(total + shippingMethod.price)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#D4AF37] to-[#A98725] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 shadow-gold-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("checkout_processing")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {t("checkout_place_order")} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="space-y-2 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Verified Gentleman Savage VIP Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Complimentary Delivery & 30-Day Alterations</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
