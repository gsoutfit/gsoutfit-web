"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
}

export function MobileBottomNav({ onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop = pathname === "/shop" || pathname === "/categories";
  const isAccount = pathname === "/account";

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0c0f]/95 backdrop-blur-2xl border-t border-[#24242B] px-3 py-2 pb-safe shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isHome ? "text-[#D4AF37]" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>

        {/* Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isShop ? "text-[#D4AF37]" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Compass className={`w-5 h-5 ${isShop ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
        </Link>

        {/* Search Modal Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 p-1 text-zinc-400 hover:text-[#D4AF37] transition-colors"
          aria-label="Search"
        >
          <div className="w-8 h-8 rounded-full bg-[#181822] border border-[#D4AF37]/30 flex items-center justify-center -mt-3 shadow-gold text-[#D4AF37]">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Search</span>
        </button>

        {/* Wishlist */}
        <Link
          href="/account?tab=wishlist"
          className="relative flex flex-col items-center gap-1 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <div className="relative">
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
        </Link>

        {/* Shopping Bag Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.75] text-[#D4AF37]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-extrabold flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-200">Bag</span>
        </button>
      </div>
    </div>
  );
}
