"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Flame, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Coupon, Product } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminMarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [minSpend, setMinSpend] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState("2026-12-31");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/coupons"),
        fetch("/api/products"),
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      if (cData.success) setCoupons(cData.data);
      if (pData.success) setProducts(pData.data);
    } catch (err) {
      console.error("Marketing fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase().trim(),
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
          minSpend: Number(minSpend),
          expiresAt: new Date(expiresAt).toISOString(),
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Coupon Created", `Coupon ${data.data.code} is now active!`, "gold");
        setIsCouponModalOpen(false);
        setCouponCode("");
        fetchData();
      }
    } catch {
      showToast("Error", "Could not create coupon code.", "error");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Coupon Deleted", "Voucher removed.", "info");
        fetchData();
      }
    } catch {
      showToast("Error", "Could not delete coupon.", "error");
    }
  };

  const handleToggleProductBadge = async (
    product: Product,
    field: "isTrending" | "isFeatured" | "isFlashSale"
  ) => {
    try {
      const updatedValue = !product[field];
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: updatedValue }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          "Product Tag Updated",
          `${product.name} ${field} set to ${updatedValue ? "Active" : "Inactive"}`
        );
        fetchData();
      }
    } catch {
      showToast("Error", "Failed to update product tag.", "error");
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Promotions, Vouchers & Flash Sales
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Marketing Suite
          </h1>
        </div>

        <button
          onClick={() => setIsCouponModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Discount Coupon
        </button>
      </div>

      {/* 1. Promotional Coupons Grid */}
      <section className="space-y-4">
        <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#D4AF37]" /> Active VIP Promotional Codes
        </h3>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-3 relative group shadow-xl"
              >
                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <span className="px-2.5 py-1 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-mono font-bold text-[#D4AF37]">
                    {c.code}
                  </span>
                </div>

                <div>
                  <p className="text-xl font-bold text-white">
                    {c.discountPercent ? `${c.discountPercent}% OFF` : `${formatPrice(c.discountAmount)} OFF`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">Min Order: {formatPrice(c.minSpend)}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-500">
                  <span>Used: {c.usageCount} times</span>
                  <span>Expires: {formatDate(c.expiresAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Homepage Curator (Featured / Trending / Flash Sale Toggles) */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Storefront Feature Curator
          </h3>
          <p className="text-xs text-zinc-400">
            Select which garments are actively highlighted in Trending, Flash Sales, and Homepage Hero sections.
          </p>
        </div>

        <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Garment</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Trending Section</th>
                  <th className="p-4 text-center">Featured Carousel</th>
                  <th className="p-4 text-center">Flash Sale Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {products.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-white">{p.name}</td>
                    <td className="p-4 font-bold text-zinc-200">{formatPrice(p.price)}</td>

                    {/* Trending Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleProductBadge(p, "isTrending")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          p.isTrending
                            ? "bg-[#D4AF37] text-black shadow-gold"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {p.isTrending ? "Active (Trending)" : "Off"}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleProductBadge(p, "isFeatured")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          p.isFeatured
                            ? "bg-blue-500 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {p.isFeatured ? "Active (Featured)" : "Off"}
                      </button>
                    </td>

                    {/* Flash Sale Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleProductBadge(p, "isFlashSale")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          p.isFlashSale
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {p.isFlashSale ? "Active (Flash Sale)" : "Off"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex justify-center items-center">
          <div
            onClick={() => setIsCouponModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#121216] border border-zinc-800 p-6 z-10 text-zinc-100 space-y-4 shadow-2xl">
            <h3 className="font-serif-luxury text-lg font-bold">Create Promotional Voucher</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP25 or LUXURY50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 uppercase font-mono focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Fixed Discount (৳ BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Minimum Order Amount (৳ BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Expiration Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold uppercase"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
