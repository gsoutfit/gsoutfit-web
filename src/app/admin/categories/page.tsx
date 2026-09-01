"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Layers, Loader2, X, Check } from "lucide-react";
import { Category } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "Clothing" as "Clothing" | "Season" | "Collection",
    description: "",
    image: "",
    itemCount: 10,
    isActive: true,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      type: "Clothing",
      description: "Handcrafted luxury tailoring and streetwear cuts.",
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
      itemCount: 8,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description,
      image: cat.image,
      itemCount: cat.itemCount,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSaving(true);

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-");
      const payload = { ...formData, slug };

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Category Updated", `${formData.name} was updated.`, "success");
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Category Created", `${formData.name} was added.`, "gold");
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch {
      showToast("Error", "Could not save category.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Category Deleted", "Category removed successfully.", "info");
        setIsDeletingId(null);
        fetchCategories();
      }
    } catch {
      showToast("Error", "Could not delete category.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Taxonomy & Lookbook Hierarchy
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Categories & Seasons ({categories.length})
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Category / Season
        </button>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              <div className="relative aspect-[16/9] bg-zinc-900">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  {cat.type}
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif-luxury text-lg font-bold text-white">{cat.name}</h3>
                    <span className="text-xs text-zinc-500 font-semibold">{cat.itemCount} Items</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-500 font-mono">
                    /{cat.slug}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsDeletingId(cat.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex justify-center items-center">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121216] border border-zinc-800 p-6 z-10 text-zinc-100 space-y-4 shadow-2xl">
            <h2 className="font-serif-luxury text-lg font-bold">
              {editingCategory ? `Edit: ${editingCategory.name}` : "Create Category or Season"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Streetwear or Summer Collection"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                >
                  <option value="Clothing">Clothing Category</option>
                  <option value="Season">Seasonal Lookbook</option>
                  <option value="Collection">Capsule Collection</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold uppercase"
                >
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 p-4 flex justify-center items-center">
          <div onClick={() => setIsDeletingId(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#141418] border border-zinc-800 p-6 z-10 text-zinc-100 space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-rose-400">Confirm Deletion</h3>
            <p className="text-xs text-zinc-300">Are you sure you want to remove this category?</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeletingId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
