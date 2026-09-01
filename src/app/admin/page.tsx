"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  Inbox,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { AnalyticsSummary, AnalyticsDataPoint } from "@/types";

type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y";

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [activeDataIndex, setActiveDataIndex] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchAnalytics = async (period: TimePeriod = selectedPeriod) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order Updated", `Order ${orderId} status changed to ${newStatus}`, "success");
        fetchAnalytics(selectedPeriod);
      }
    } catch {
      showToast("Error", "Could not update order status", "error");
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Computing Real-Time Store Metrics...
        </p>
      </div>
    );
  }

  if (!analytics) return null;

  const trajectory = analytics.trajectory || [];
  const maxRevenue = Math.max(...trajectory.map((t) => t.revenue), 1);
  const hasTrajectoryData = trajectory.some((t) => t.revenue > 0 || t.orders > 0);

  const periods: { id: TimePeriod; label: string }[] = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "3m", label: "3 Months" },
    { id: "6m", label: "6 Months" },
    { id: "1y", label: "1 Year" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Real Business Operating System
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Store Performance & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" /> + Add New Garment
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Strictly Real Computed Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Gross Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {formatPrice(analytics.totalRevenue)}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              {analytics.salesGrowth >= 0 ? (
                <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{analytics.salesGrowth}%
                </span>
              ) : (
                <span className="font-semibold text-rose-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {analytics.salesGrowth}%
                </span>
              )}
              <span className="text-zinc-500">growth in selected period</span>
            </div>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Completed Orders
            </span>
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">{analytics.totalOrders}</p>
            <p className="text-[11px] font-semibold text-[#D4AF37] mt-1">
              Avg Order Value: {formatPrice(analytics.averageOrderValue)}
            </p>
          </div>
        </div>

        {/* Total Products Sold */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Garments Sold
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">{analytics.productsSold}</p>
            <p className="text-[11px] font-semibold text-zinc-400 mt-1">
              Units dispatched across all orders
            </p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#24242B] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Recent Velocity
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Today:</span>
              <span className="font-bold text-white">{formatPrice(analytics.todayRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">This Week:</span>
              <span className="font-bold text-white">{formatPrice(analytics.thisWeekRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">This Month:</span>
              <span className="font-bold text-[#D4AF37]">{formatPrice(analytics.thisMonthRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Sales Trajectory Chart Section */}
      <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" /> Revenue & Sales Trajectory
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real chronological sales aggregation computed directly from actual client checkouts.
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#181820] p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPeriod === p.id
                    ? "bg-[#D4AF37] text-black shadow-gold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        {!hasTrajectoryData ? (
          <div className="py-20 text-center space-y-3 rounded-2xl bg-[#141418] border border-dashed border-zinc-800">
            <Inbox className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="font-serif-luxury text-base font-bold text-zinc-300">No sales data yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Once orders are placed during this {selectedPeriod} period, real revenue trajectories and velocity curves will render here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Data Tooltip Indicator */}
            <div className="h-6 flex items-center justify-between text-xs px-2">
              {activeDataIndex !== null && trajectory[activeDataIndex] ? (
                <div className="flex items-center gap-4 text-[#D4AF37] font-semibold animate-fade-in">
                  <span>Date: <strong className="text-white">{trajectory[activeDataIndex].label}</strong></span>
                  <span>Gross: <strong className="text-white">{formatPrice(trajectory[activeDataIndex].revenue)}</strong></span>
                  <span>Orders: <strong className="text-white">{trajectory[activeDataIndex].orders}</strong></span>
                  <span>Units Sold: <strong className="text-white">{trajectory[activeDataIndex].itemsSold}</strong></span>
                </div>
              ) : (
                <span className="text-zinc-500 text-[11px]">Hover or tap on bars to inspect specific date metrics</span>
              )}
            </div>

            {/* Interactive SVG / CSS Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-800 pb-2">
              {trajectory.map((point, idx) => {
                const heightPercent = maxRevenue > 0 ? Math.max(8, (point.revenue / maxRevenue) * 100) : 8;
                const isHovered = activeDataIndex === idx;

                return (
                  <div
                    key={point.date + idx}
                    onMouseEnter={() => setActiveDataIndex(idx)}
                    onMouseLeave={() => setActiveDataIndex(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-full bg-[#181822] rounded-t-xl overflow-hidden h-44 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          point.revenue > 0
                            ? isHovered
                              ? "bg-gradient-to-t from-[#E5C365] to-[#FFF0C8] brightness-125 shadow-gold"
                              : "bg-gradient-to-t from-[#A98725] to-[#D4AF37]"
                            : "bg-zinc-800/40"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white transition-colors truncate max-w-[45px]">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inventory Alerts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Low Stock Alerts */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Inventory Alerts
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              {analytics.lowStockProducts.length} Items Below Threshold
            </span>
          </div>

          {analytics.lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              All garment inventory levels are healthy.
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {analytics.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#18181f] border border-zinc-800 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-zinc-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-500">{p.category} • {formatPrice(p.price)}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold text-center block transition-colors"
          >
            Manage Inventory
          </Link>
        </div>

        {/* Right: Top Selling Products */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D4AF37]" /> Top Garments by Sales Volume
            </h3>
            <span className="text-xs text-zinc-500 font-semibold">Real Purchases</span>
          </div>

          {analytics.topSellingProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              No sales records logged yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {analytics.topSellingProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#18181f] border border-zinc-800 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-400">
                      Views: {p.views || 0} • Bag Adds: {p.cartAdds || 0}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shrink-0">
                    {p.salesCount || 0} Sold
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/marketing"
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold text-center block transition-colors"
          >
            Curate Featured & Trending
          </Link>
        </div>
      </div>

      {/* Recent Orders Live Table with Instant Status Modifier */}
      <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-white">
              Recent Customer Orders ({analytics.totalOrders})
            </h3>
            <p className="text-xs text-zinc-400">Live order fulfillment stream with direct status dispatch</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            Manage All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {analytics.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No customer orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Order No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#D4AF37]">{order.orderNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-white">{order.customer.name}</p>
                      <p className="text-[11px] text-zinc-500">{order.customer.email}</p>
                    </td>
                    <td className="p-3 font-semibold">{order.items.length} garments</td>
                    <td className="p-3 font-bold text-white">{formatPrice(order.total)}</td>
                    <td className="p-3 text-zinc-400">{formatDate(order.createdAt)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : order.status === "Shipped"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        <option value="Pending" className="bg-zinc-900 text-white">Pending</option>
                        <option value="Processing" className="bg-zinc-900 text-white">Processing</option>
                        <option value="Shipped" className="bg-zinc-900 text-white">Shipped</option>
                        <option value="Delivered" className="bg-zinc-900 text-white">Delivered</option>
                        <option value="Cancelled" className="bg-zinc-900 text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs text-[#D4AF37] hover:underline font-semibold"
                      >
                        Details →
                      </Link>
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
