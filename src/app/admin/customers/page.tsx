"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Search, Shield, UserCheck, Loader2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error("Customers error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Role Updated", `User role updated to ${newRole}`, "success");
        fetchCustomers();
      }
    } catch {
      showToast("Error", "Could not toggle user role", "error");
    }
  };

  const filtered = (customers || []).filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            VIP Client Directory & CRM
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Customer Accounts ({customers.length})
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by client name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Member Since</th>
                  <th className="p-4 text-right">Role Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden relative shrink-0">
                          <Image
                            src={
                              c.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`
                            }
                            alt={c.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-[11px] text-zinc-500">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.role === "admin"
                            ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-zinc-200">{c.orderCount || 0} orders</td>

                    <td className="p-4 font-bold text-white text-sm">
                      {formatPrice(c.totalSpent || 0)}
                    </td>

                    <td className="p-4 text-zinc-400">{formatDate(c.createdAt)}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(c.id, c.role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          c.role === "admin"
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            : "bg-[#D4AF37] hover:bg-[#E5C365] text-black"
                        }`}
                      >
                        {c.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
