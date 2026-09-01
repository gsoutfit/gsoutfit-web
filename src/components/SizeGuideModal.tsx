"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, CheckCircle2 } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export function SizeGuideModal({ isOpen, onClose, category = "General" }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"inches" | "cm">("inches");
  const [activeTab, setActiveTab] = useState<"apparel" | "pants" | "shoes">("apparel");

  if (!isOpen) return null;

  const apparelData = [
    { size: "XS", chestIn: "34 - 36", chestCm: "86 - 91", waistIn: "28 - 30", waistCm: "71 - 76", shoulderIn: "17.0", shoulderCm: "43.2" },
    { size: "S", chestIn: "36 - 38", chestCm: "91 - 96", waistIn: "30 - 32", waistCm: "76 - 81", shoulderIn: "17.5", shoulderCm: "44.5" },
    { size: "M", chestIn: "38 - 40", chestCm: "96 - 101", waistIn: "32 - 34", waistCm: "81 - 86", shoulderIn: "18.0", shoulderCm: "45.7" },
    { size: "L", chestIn: "40 - 42", chestCm: "101 - 106", waistIn: "34 - 36", waistCm: "86 - 91", shoulderIn: "18.7", shoulderCm: "47.5" },
    { size: "XL", chestIn: "42 - 44", chestCm: "106 - 111", waistIn: "36 - 38", waistCm: "91 - 96", shoulderIn: "19.5", shoulderCm: "49.5" },
    { size: "XXL", chestIn: "44 - 46", chestCm: "111 - 116", waistIn: "38 - 40", waistCm: "96 - 101", shoulderIn: "20.2", shoulderCm: "51.3" },
  ];

  const pantsData = [
    { size: "30", waistIn: "30", waistCm: "76", hipIn: "37", hipCm: "94", inseamIn: "32", inseamCm: "81" },
    { size: "32", waistIn: "32", waistCm: "81", hipIn: "39", hipCm: "99", inseamIn: "32", inseamCm: "81" },
    { size: "34", waistIn: "34", waistCm: "86", hipIn: "41", hipCm: "104", inseamIn: "34", inseamCm: "86" },
    { size: "36", waistIn: "36", waistCm: "91", hipIn: "43", hipCm: "109", inseamIn: "34", inseamCm: "86" },
    { size: "38", waistIn: "38", waistCm: "96", hipIn: "45", hipCm: "114", inseamIn: "34", inseamCm: "86" },
  ];

  const shoesData = [
    { eu: "EU 40", us: "US 7.5", uk: "UK 6.5", lengthCm: "25.4" },
    { eu: "EU 41", us: "US 8.5", uk: "UK 7.5", lengthCm: "26.0" },
    { eu: "EU 42", us: "US 9.5", uk: "UK 8.5", lengthCm: "26.7" },
    { eu: "EU 43", us: "US 10.5", uk: "UK 9.5", lengthCm: "27.3" },
    { eu: "EU 44", us: "US 11.5", uk: "UK 10.5", lengthCm: "27.9" },
    { eu: "EU 45", us: "US 12.5", uk: "UK 11.5", lengthCm: "28.6" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex justify-center items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-2xl bg-[#121216] border border-[#2A2A33] shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-zinc-100 p-4 sm:p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Ruler className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h2 className="font-serif-luxury text-lg font-bold">Bespoke Sizing & Fit Guide</h2>
                <p className="text-xs text-zinc-400">Gentleman Savage precision measurements</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Category tabs & Unit switch */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
            {/* Tabs */}
            <div className="flex flex-wrap sm:flex-nowrap justify-center rounded-xl bg-[#18181f] p-1 border border-zinc-800 text-xs font-semibold w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("apparel")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "apparel" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Jackets & Tops
              </button>
              <button
                onClick={() => setActiveTab("pants")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "pants" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Trousers & Jeans
              </button>
              <button
                onClick={() => setActiveTab("shoes")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-none ${
                  activeTab === "shoes" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Footwear
              </button>
            </div>

            {/* Unit Toggle */}
            {activeTab !== "shoes" && (
              <div className="flex items-center rounded-xl bg-[#18181f] p-1 border border-zinc-800 text-xs font-semibold">
                <button
                  onClick={() => setUnit("inches")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    unit === "inches" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  onClick={() => setUnit("cm")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    unit === "cm" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#16161c]">
            {activeTab === "apparel" && (
              <table className="w-full text-xs text-left min-w-[400px]">
                <thead className="bg-[#1e1e26] text-[#D4AF37] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest ({unit === "inches" ? "in" : "cm"})</th>
                    <th className="p-3">Waist ({unit === "inches" ? "in" : "cm"})</th>
                    <th className="p-3">Shoulder ({unit === "inches" ? "in" : "cm"})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {apparelData.map((row) => (
                    <tr key={row.size} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-bold text-white">{row.size}</td>
                      <td className="p-3">{unit === "inches" ? row.chestIn : row.chestCm}</td>
                      <td className="p-3">{unit === "inches" ? row.waistIn : row.waistCm}</td>
                      <td className="p-3">{unit === "inches" ? row.shoulderIn : row.shoulderCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "pants" && (
              <table className="w-full text-xs text-left min-w-[400px]">
                <thead className="bg-[#1e1e26] text-[#D4AF37] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Waist Size</th>
                    <th className="p-3">Waist ({unit === "inches" ? "in" : "cm"})</th>
                    <th className="p-3">Hips ({unit === "inches" ? "in" : "cm"})</th>
                    <th className="p-3">Inseam ({unit === "inches" ? "in" : "cm"})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {pantsData.map((row) => (
                    <tr key={row.size} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-bold text-white">{row.size}</td>
                      <td className="p-3">{unit === "inches" ? row.waistIn : row.waistCm}</td>
                      <td className="p-3">{unit === "inches" ? row.hipIn : row.hipCm}</td>
                      <td className="p-3">{unit === "inches" ? row.inseamIn : row.inseamCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "shoes" && (
              <table className="w-full text-xs text-left min-w-[400px]">
                <thead className="bg-[#1e1e26] text-[#D4AF37] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">EU Size</th>
                    <th className="p-3">US Size</th>
                    <th className="p-3">UK Size</th>
                    <th className="p-3">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {shoesData.map((row) => (
                    <tr key={row.eu} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-bold text-white">{row.eu}</td>
                      <td className="p-3">{row.us}</td>
                      <td className="p-3">{row.uk}</td>
                      <td className="p-3">{row.lengthCm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sizing Advisory */}
          <div className="p-3.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Fit Advisory:
            </p>
            <p>
              • <strong>Gentleman Outerwear & Suiting:</strong> Cut slim with architectural shoulders. If you plan to wear thick knitwear beneath, consider sizing up.
            </p>
            <p>
              • <strong>Savage Hoodies & Tees:</strong> Designed with a relaxed, dropped-shoulder boxy drape. Size down if you prefer a slim tailored fit.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
