"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protected route check
  useEffect(() => {
    const isAuthPage =
      pathname === "/admin/login" ||
      pathname === "/admin/register" ||
      pathname === "/admin/verify";

    if (!isLoading && !isAuthPage) {
      if (!user || user.role !== "admin") {
        router.push("/admin/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  // If on login, register, or verify page, render children directly
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/verify"
  ) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  // Navigation Items
  const adminNav = [
    { name: "Overview & Analytics", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Products (CRUD)", href: "/admin/products", icon: <Package className="w-4 h-4" /> },
    { name: "Categories & Seasons", href: "/admin/categories", icon: <Layers className="w-4 h-4" /> },
    { name: "Order Management", href: "/admin/orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Customer Accounts", href: "/admin/customers", icon: <Users className="w-4 h-4" /> },
    { name: "Marketing & Coupons", href: "/admin/marketing", icon: <Tag className="w-4 h-4" /> },
    { name: "Security & Audit Logs", href: "/admin/security", icon: <ShieldAlert className="w-4 h-4" /> },
    { name: "Store Settings & Theme", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121216] border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D4AF37]" />
          <span className="font-cinzel font-bold text-sm text-white">GENTLEMEN SAVAGE</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-zinc-800 text-zinc-300"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0F0F13] border-r border-[#24242B] flex flex-col justify-between p-5 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="border-b border-zinc-800/80 pb-4">
            <Link href="/admin" className="block">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-cinzel text-xs font-black tracking-widest text-white block">
                    GENTLEMEN SAVAGE
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
                    Admin Portal
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "bg-[#D4AF37] text-black font-bold shadow-gold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Admin Profile & Store Preview */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-[#D4AF37] border border-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Live Store
            </span>
            <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded">
              Live
            </span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#141418] border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden relative shrink-0">
                <Image
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  }
                  alt="Admin"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-[9px] text-[#D4AF37] uppercase font-bold">Master Administrator</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                router.push("/admin/login");
              }}
              className="text-zinc-500 hover:text-rose-400 p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
