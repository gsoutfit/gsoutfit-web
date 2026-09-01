"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "compact" | "dropdown";
}

export function LanguageSwitcher({ className = "", variant = "pill" }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-[#D4AF37] transition-colors ${className}`}
        title={language === "en" ? "Switch to বাংলা" : "Switch to English"}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>{language === "en" ? "বাংলা" : "EN"}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[#121216] border border-zinc-800/90 p-0.5 text-[11px] font-semibold tracking-wider shadow-inner ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all duration-300 text-[11px] ${
          language === "en"
            ? "bg-[#D4AF37] text-black font-black shadow-gold"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={`px-2.5 py-1 rounded-full transition-all duration-300 text-[11px] ${
          language === "bn"
            ? "bg-[#D4AF37] text-black font-black shadow-gold"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
