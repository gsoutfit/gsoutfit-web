"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Search,
  ChevronDown,
  Loader2,
  FileText,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newTracking, setNewTracking] = useState("");
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string, tracking?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: tracking || selectedOrder?.trackingNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Status Updated", `Order #${orderId} status changed to ${status}`, "success");
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.data);
        }
        fetchOrders();
      }
    } catch {
      showToast("Error", "Could not update order status.", "error");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Fulfillment & VIP Dispatch
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Orders Management ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order #, client name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap gap-1.5 bg-[#141418] p-1.5 rounded-2xl border border-zinc-800 text-xs font-semibold">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === st
                  ? "bg-[#D4AF37] text-black font-bold shadow-gold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
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
                  <th className="p-4">Order No</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Placed Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#D4AF37]">{order.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{order.customer.name}</p>
                      <p className="text-[11px] text-zinc-500">{order.customer.email}</p>
                    </td>
                    <td className="p-4 font-semibold">{order.items.length} garments</td>
                    <td className="p-4 font-bold text-white text-sm">{formatPrice(order.total)}</td>
                    <td className="p-4 text-zinc-400">{formatDate(order.createdAt)}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black font-bold text-xs transition-colors"
                      >
                        Inspect Dossier →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 p-4 sm:p-6 md:p-10 flex justify-center items-center overflow-y-auto">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#121216] border border-[#2A2A33] shadow-2xl p-6 sm:p-8 z-10 text-zinc-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="font-mono text-sm font-bold text-[#D4AF37]">
                  Order #{selectedOrder.orderNumber}
                </span>
                <h2 className="font-serif-luxury text-xl font-bold text-white">Order Dossier</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Printable Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)}>
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Client & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#18181f] border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Client Details</span>
                <p className="font-bold text-white text-sm">{selectedOrder.customer.name}</p>
                <p className="text-zinc-400">{selectedOrder.customer.email}</p>
                <p className="text-zinc-400">{selectedOrder.customer.phone || "No phone provided"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181f] border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Payment Information</span>
                <p className="font-bold text-white uppercase text-sm">
                  {selectedOrder.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : selectedOrder.paymentMethod === "bkash"
                    ? "bKash"
                    : "Nagad"}
                </p>
                {selectedOrder.paymentDetails?.senderNumber && (
                  <p className="text-zinc-400">Sender: <span className="font-mono text-zinc-200">{selectedOrder.paymentDetails.senderNumber}</span></p>
                )}
                {selectedOrder.paymentDetails?.transactionId && (
                  <p className="text-[#D4AF37] font-mono font-bold">TrxID: {selectedOrder.paymentDetails.transactionId}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#18181f] border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Shipping Address</span>
                <p className="text-zinc-200 leading-relaxed">
                  {selectedOrder.shippingAddress.street}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zip}<br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Tracking Number Modifier */}
            <div className="p-4 rounded-2xl bg-[#18181f] border border-zinc-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-500">VIP Courier Tracking Code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={selectedOrder.trackingNumber || ""}
                  placeholder="e.g. GS-FDX-998823101"
                  onChange={(e) => setNewTracking(e.target.value)}
                  className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-xs"
                />
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      selectedOrder.status,
                      newTracking || selectedOrder.trackingNumber
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
                >
                  Save Code
                </button>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                Garments in Order ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#18181f] border border-zinc-800 text-xs"
                  >
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-100 truncate">{item.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-white text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 rounded-2xl bg-[#18181f] border border-zinc-800 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-zinc-200">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({selectedOrder.couponCode}):</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-zinc-200">{formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Settled:</span>
                <span className="text-[#D4AF37]">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 p-4 flex justify-center items-center bg-black/90">
          <div className="bg-white text-black p-8 rounded-3xl max-w-xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold tracking-wider">GENTLEMAN SAVAGE</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  Official Commercial Invoice
                </p>
              </div>
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="text-zinc-500 hover:text-black font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 text-xs">
              <div>
                <span className="font-bold text-zinc-500">BILLED TO:</span>
                <p className="font-bold">{selectedOrder.customer.name}</p>
                <p className="text-zinc-600">{selectedOrder.customer.email}</p>
                <p className="text-zinc-600">{selectedOrder.shippingAddress.street}</p>
                <p className="text-zinc-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold font-mono text-sm">INVOICE #{selectedOrder.orderNumber}</p>
                <p className="text-zinc-600">Date: {formatDate(selectedOrder.createdAt)}</p>
                <p className="text-zinc-600">Tracking: {selectedOrder.trackingNumber || "N/A"}</p>
                <p className="text-zinc-600 font-semibold text-emerald-600 uppercase">
                  STATUS: {selectedOrder.status}
                </p>
                <p className="text-zinc-700 font-bold uppercase text-[11px]">
                  PAYMENT: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : selectedOrder.paymentMethod === "bkash" ? "bKash" : "Nagad"}
                  {selectedOrder.paymentDetails?.transactionId ? ` (${selectedOrder.paymentDetails.transactionId})` : ""}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border-y border-zinc-200">
              <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase">
                <tr>
                  <th className="p-2">Item</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {selectedOrder.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-semibold">{i.name}</td>
                    <td className="p-2">{i.size}</td>
                    <td className="p-2">{i.quantity}</td>
                    <td className="p-2 text-right font-bold">{formatPrice(i.price * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right text-xs space-y-1">
              <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
              <p>Shipping: {formatPrice(selectedOrder.shippingFee)}</p>
              <p className="font-bold text-sm text-black border-t border-zinc-300 pt-1">
                Grand Total: {formatPrice(selectedOrder.total)}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 text-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-2 rounded-xl bg-black text-white font-bold text-xs uppercase"
              >
                Print Official Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
