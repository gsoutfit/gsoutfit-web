"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Shield,
  LogOut,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  Printer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Order, Product } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "orders";

  const { user, login, register, logout, switchDemoRole } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Orders fetch error:", err);
      }
    }
    loadOrders();
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await login(authEmail, authPassword);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await register(authName, authEmail, authPassword, authPhone);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // If not logged in, show Auth Gate with 1-Click Demo Logins
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="font-cinzel text-xs font-bold tracking-widest text-[#D4AF37]">
            GENTLEMAN SAVAGE CONCIERGE
          </span>
          <h1 className="font-serif-luxury text-3xl font-black text-white">
            {authMode === "login" ? "Client Sign In" : "Create VIP Account"}
          </h1>
          <p className="text-xs text-zinc-400">
            Access your orders, bespoke tailoring files, and curated wishlists.
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4 shadow-2xl">

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
              {authError}
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@gentlemansavage.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold uppercase tracking-wider transition-colors shadow-gold"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Julian Sterling"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="julian@gentlemansavage.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-extrabold uppercase tracking-wider transition-colors shadow-gold"
              >
                Create Account
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800">
            {authMode === "login" ? (
              <p>
                Don&apos;t have an account yet?{" "}
                <button
                  onClick={() => setAuthMode("register")}
                  className="text-[#D4AF37] hover:underline font-bold"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-[#D4AF37] hover:underline font-bold"
                >
                  Sign In Here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-[#D4AF37]">
            <Image
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0b0b0c&textColor=d4af37`
              }
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury text-xl sm:text-2xl font-black text-white">
                {user.name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user.role === "admin"
                  ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                  : "bg-zinc-800 text-zinc-300"
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#18181f] hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 font-semibold text-xs border border-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
          </button>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-nowrap rounded-2xl bg-[#121216] p-1.5 border border-[#24242B] overflow-x-auto text-xs font-bold uppercase tracking-wider gap-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shrink-0 whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-[#D4AF37] text-black shadow-gold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" /> Order History ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shrink-0 whitespace-nowrap ${
            activeTab === "wishlist"
              ? "bg-[#D4AF37] text-black shadow-gold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" /> Saved Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shrink-0 whitespace-nowrap ${
            activeTab === "addresses"
              ? "bg-[#D4AF37] text-black shadow-gold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <MapPin className="w-4 h-4" /> Address Book
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shrink-0 whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-[#D4AF37] text-black shadow-gold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <UserIcon className="w-4 h-4" /> Profile & Security
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#121216] border border-zinc-800 p-8 space-y-4">
              <Package className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="font-bold text-base text-zinc-200">No Orders Placed Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore our catalog to place your first bespoke luxury order.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
              >
                Shop Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl bg-[#121216] border border-[#24242B] p-6 space-y-6 shadow-xl"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 text-xs">
                    <div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Order No:</span>
                      <p className="font-mono font-bold text-sm text-[#D4AF37]">{order.orderNumber}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Placed On:</span>
                      <p className="text-zinc-200 font-semibold">{formatDate(order.createdAt)}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Total Amount:</span>
                      <p className="font-bold text-sm text-white">{formatPrice(order.total)}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Payment:</span>
                      <p className="text-zinc-200 font-semibold text-xs capitalize">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : order.paymentMethod === "bkash"
                          ? `bKash ${order.paymentDetails?.transactionId ? `(${order.paymentDetails.transactionId})` : ""}`
                          : `Nagad ${order.paymentDetails?.transactionId ? `(${order.paymentDetails.transactionId})` : ""}`}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Status:</span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : order.status === "Shipped"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Timeline Stepper */}
                  <div className="py-2">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#D4AF37]" /> Tracking: {order.trackingNumber || "Assigned Upon Dispatch"}
                      </span>
                      <span className="text-[#D4AF37]">{order.shippingMethod}</span>
                    </div>

                    {/* Progress Bar Steps */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase">
                      {["Pending", "Processing", "Shipped", "Delivered"].map((step, idx) => {
                        const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
                        const currentIdx = statuses.indexOf(order.status);
                        const isDone = currentIdx >= idx;
                        return (
                          <div key={step} className="space-y-1.5">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isDone
                                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]"
                                  : "bg-zinc-800"
                              }`}
                            />
                            <span className={isDone ? "text-[#FAF8F5]" : "text-zinc-600"}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#18181f] border border-zinc-800/80"
                      >
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-zinc-100 truncate">{item.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                          <p className="text-xs font-bold text-[#D4AF37] mt-0.5">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#121216] border border-zinc-800 p-8 space-y-4">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="font-bold text-base text-zinc-200">No Saved Favorites</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Save pieces to your curated wishlist while browsing our collections.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#141418] border border-zinc-800 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative aspect-[3/4] bg-zinc-900">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-rose-400 hover:text-white"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100 truncate">{item.name}</h4>
                      <p className="font-bold text-xs text-[#D4AF37] mt-1">
                        {formatPrice(item.discountPrice ?? item.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(item, item.sizes[0], item.colors[0]?.name || "Standard", 1);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === "addresses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#D4AF37]/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                Default Delivery Address
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">{user.name}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {user.addresses && user.addresses[0] ? (
                <>
                  {user.addresses[0].street}<br />
                  {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].zip}<br />
                  {user.addresses[0].country}<br />
                  Phone: {user.phone || "+880 1700-000000"}
                </>
              ) : (
                <>
                  Primary Address on File<br />
                  Dhaka, Bangladesh<br />
                  Phone: {user.phone || "Not specified"}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Profile & Security */}
      {activeTab === "profile" && (
        <div className="w-full max-w-2xl rounded-3xl bg-[#121216] border border-[#24242B] p-6 sm:p-8 space-y-6">
          <h3 className="font-serif-luxury text-lg font-bold text-white">Profile Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Email Address</label>
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Phone Number</label>
              <input
                type="tel"
                defaultValue={user.phone || ""}
                placeholder="+880 1700-000000"
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Account Role</label>
              <input
                type="text"
                defaultValue={user.role}
                disabled
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-500 capitalize cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
