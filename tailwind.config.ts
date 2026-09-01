import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background, #0B0B0C)",
        foreground: "var(--foreground, #FAF8F5)",
        brand: {
          dark: "var(--background, #0B0B0C)",
          surface: "var(--brand-card, #121215)",
          card: "var(--brand-card, #18181C)",
          border: "#2A2A32",
          gold: "var(--brand-gold, #D4AF37)",
          "gold-light": "var(--brand-secondary, #EED88A)",
          "gold-dark": "#9E7D1C",
          primary: "var(--brand-primary, #D4AF37)",
          secondary: "var(--brand-secondary, #E5C365)",
          accent: "var(--brand-accent, #C5A880)",
          btn: "var(--brand-btn, #D4AF37)",
          btnText: "var(--brand-btn-text, #000000)",
          champagne: "#F4EBD9",
          cream: "var(--foreground, #FAF8F5)",
          sand: "#EAE5DC",
          crimson: "#DC2626",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        gold: "0 4px 25px -5px var(--brand-gold-glow, rgba(212, 175, 55, 0.25))",
        "gold-lg": "0 10px 40px -10px var(--brand-gold-glow, rgba(212, 175, 55, 0.35))",
        luxury: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
