"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Sparkles,
  Flame,
  AlertTriangle,
  Loader2,
  Star,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = [
  "Jackets",
  "Hoodies",
  "Shirts",
  "T-Shirts",
  "Pants",
  "Jeans",
  "Formal Wear",
  "Casual Wear",
  "Streetwear",
  "Accessories",
];

const SEASONS = ["Summer Collection", "Winter Collection", "All-Season"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    fabricCare: "",
    fitDetails: "",
    price: 150,
    discountPrice: 0,
    category: "Jackets",
    season: "Winter Collection" as "Summer Collection" | "Winter Collection" | "All-Season",
    sizes: "S, M, L, XL",
    colors: "Obsidian Black, Charcoal",
    stock: 20,
    images: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
    tags: "Luxury, Outerwear, Streetwear",
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    isFlashSale: false,
    flashSaleDiscount: 0,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Products error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      tagline: "",
      description: "",
      fabricCare: "100% Handcrafted Premium Fabric. Specialist Dry Clean Only.",
      fitDetails: "Tailored modern silhouette. True to size.",
      price: 180,
      discountPrice: 0,
      category: "Jackets",
      season: "Winter Collection",
      sizes: "S, M, L, XL",
      colors: "Obsidian Black (#0F0F10), Charcoal (#2E2E32)",
      stock: 25,
      images:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
      tags: "Outerwear, Bespoke, Luxury",
      isFeatured: false,
      isTrending: false,
      isNewArrival: true,
      isFlashSale: false,
      flashSaleDiscount: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      tagline: product.tagline || "",
      description: product.description,
      fabricCare: product.fabricCare || "",
      fitDetails: product.fitDetails || "",
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: product.category,
      season: product.season,
      sizes: product.sizes.join(", "),
      colors: product.colors.map((c) => c.name).join(", "),
      stock: product.stock,
      images: product.images.join("\n"),
      tags: product.tags.join(", "),
      isFeatured: Boolean(product.isFeatured),
      isTrending: Boolean(product.isTrending),
      isNewArrival: Boolean(product.isNewArrival),
      isFlashSale: Boolean(product.isFlashSale),
      flashSaleDiscount: product.flashSaleDiscount || 0,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return;
    setIsSaving(true);

    try {
      const parsedSizes = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedColors = formData.colors
        .split(",")
        .map((c) => {
          const name = c.trim();
          return { name, hex: "#18181f" };
        })
        .filter((c) => c.name.length > 0);

      const parsedImages = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter(Boolean);

      const parsedTags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        fabricCare: formData.fabricCare,
        fitDetails: formData.fitDetails,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        category: formData.category,
        season: formData.season,
        sizes: parsedSizes.length ? parsedSizes : ["S", "M", "L"],
        colors: parsedColors.length ? parsedColors : [{ name: "Standard", hex: "#000000" }],
        stock: Number(formData.stock),
        images: parsedImages.length
          ? parsedImages
          : ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"],
        tags: parsedTags,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        isFlashSale: formData.isFlashSale,
        flashSaleDiscount: formData.flashSaleDiscount ? Number(formData.flashSaleDiscount) : undefined,
      };

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Product Updated", `${payload.name} was successfully updated.`, "success");
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        // POST create
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Product Created", `${payload.name} added to catalog.`, "gold");
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch {
      showToast("Error", "Could not save garment.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product Deleted", "Garment removed from catalog.", "info");
        setIsDeletingId(null);
        fetchProducts();
      }
    } catch {
      showToast("Error", "Failed to delete product.", "error");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Catalog & Inventory Management
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Garments & Products ({products.length})
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Garment
        </button>
      </div>

      {/* Controls: Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2.5 bg-[#141418] border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-bold uppercase">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Garment</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Season</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Media + Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white truncate max-w-xs">{p.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">SKU: {p.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-zinc-300">{p.category}</td>

                    {/* Season */}
                    <td className="p-4 font-semibold text-[#D4AF37]">{p.season}</td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">
                        {formatPrice(p.discountPrice ?? p.price)}
                      </div>
                      {p.discountPrice && (
                        <span className="text-[11px] text-zinc-500 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.stock <= 5
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : p.stock <= 15
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isTrending && (
                          <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold">
                            Trending
                          </span>
                        )}
                        {p.isFlashSale && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                            Flash Sale
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-300 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsDeletingId(p.id)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex justify-center items-center">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#121216] border border-[#2A2A33] shadow-2xl p-6 sm:p-8 z-10 text-zinc-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="font-serif-luxury text-xl font-bold">
                {editingProduct ? `Edit Garment: ${editingProduct.name}` : "Add New Luxury Garment"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Garment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Obsidian Raw Leather Biker Jacket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Tagline / Subheading</label>
                <input
                  type="text"
                  placeholder="e.g. Hand-buffed Italian calfskin with gunmetal hardware."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe tailoring, origin, styling notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    Discount Price (৳ BDT, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        season: e.target.value as "Summer Collection" | "Winter Collection" | "All-Season",
                      })
                    }
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Sizes (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Colors (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                  Image URLs (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-[11px]"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlashSale}
                    onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-400">Flash Sale</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Garment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 p-4 flex justify-center items-center">
          <div
            onClick={() => setIsDeletingId(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#141418] border border-zinc-800 p-6 z-10 text-zinc-100 space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-rose-400">Confirm Deletion</h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently remove this garment from the database? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(isDeletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
