"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StoreSettings, ThemeColors } from "@/types";
import { useToast } from "./ToastContext";

export const DEFAULT_THEME: ThemeColors = {
  primaryColor: "#D4AF37",
  secondaryColor: "#E5C365",
  accentColor: "#C5A880",
  backgroundColor: "#0B0B0C",
  cardColor: "#141418",
  textColor: "#FAF8F5",
  buttonColor: "#D4AF37",
  buttonTextColor: "#000000",
};

interface ThemeContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  isCustomThemeEnabled: boolean;
  activeColors: ThemeColors;
  previewColors: ThemeColors | null;
  setPreviewColors: (colors: ThemeColors | null) => void;
  updateThemeColors: (colors: Partial<ThemeColors>, enableCustom?: boolean) => Promise<boolean>;
  toggleCustomTheme: (enabled: boolean) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewColors, setPreviewColors] = useState<ThemeColors | null>(null);
  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("ThemeContext: failed to load settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isCustomThemeEnabled = Boolean(settings?.appearance?.customThemeEnabled);

  const activeColors: ThemeColors = previewColors
    ? previewColors
    : isCustomThemeEnabled && settings?.appearance
    ? {
        primaryColor: settings.appearance.primaryColor || DEFAULT_THEME.primaryColor,
        secondaryColor: settings.appearance.secondaryColor || DEFAULT_THEME.secondaryColor,
        accentColor: settings.appearance.accentColor || DEFAULT_THEME.accentColor,
        backgroundColor: settings.appearance.backgroundColor || DEFAULT_THEME.backgroundColor,
        cardColor: settings.appearance.cardColor || DEFAULT_THEME.cardColor,
        textColor: settings.appearance.textColor || DEFAULT_THEME.textColor,
        buttonColor: settings.appearance.buttonColor || DEFAULT_THEME.buttonColor,
        buttonTextColor: settings.appearance.buttonTextColor || DEFAULT_THEME.buttonTextColor,
      }
    : DEFAULT_THEME;

  // Apply CSS custom variables to document root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (isCustomThemeEnabled || previewColors) {
      root.style.setProperty("--brand-gold", activeColors.primaryColor);
      root.style.setProperty("--brand-primary", activeColors.primaryColor);
      root.style.setProperty("--brand-secondary", activeColors.secondaryColor);
      root.style.setProperty("--brand-accent", activeColors.accentColor);
      root.style.setProperty("--background", activeColors.backgroundColor);
      root.style.setProperty("--brand-card", activeColors.cardColor);
      root.style.setProperty("--foreground", activeColors.textColor);
      root.style.setProperty("--brand-btn", activeColors.buttonColor);
      root.style.setProperty("--brand-btn-text", activeColors.buttonTextColor);
      root.style.setProperty("--brand-gold-glow", `${activeColors.primaryColor}33`);
    } else {
      // Revert to default
      root.style.setProperty("--brand-gold", DEFAULT_THEME.primaryColor);
      root.style.setProperty("--brand-primary", DEFAULT_THEME.primaryColor);
      root.style.setProperty("--brand-secondary", DEFAULT_THEME.secondaryColor);
      root.style.setProperty("--brand-accent", DEFAULT_THEME.accentColor);
      root.style.setProperty("--background", DEFAULT_THEME.backgroundColor);
      root.style.setProperty("--brand-card", DEFAULT_THEME.cardColor);
      root.style.setProperty("--foreground", DEFAULT_THEME.textColor);
      root.style.setProperty("--brand-btn", DEFAULT_THEME.buttonColor);
      root.style.setProperty("--brand-btn-text", DEFAULT_THEME.buttonTextColor);
      root.style.setProperty("--brand-gold-glow", "rgba(212, 175, 55, 0.2)");
    }
  }, [activeColors, isCustomThemeEnabled, previewColors]);

  const updateThemeColors = async (
    colors: Partial<ThemeColors>,
    enableCustom = true
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: {
            ...colors,
            customThemeEnabled: enableCustom,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setPreviewColors(null);
        showToast("Theme Saved", "Custom store appearance applied successfully.", "gold");
        return true;
      }
      return false;
    } catch {
      showToast("Error", "Could not save custom theme colors.", "error");
      return false;
    }
  };

  const toggleCustomTheme = async (enabled: boolean): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: {
            customThemeEnabled: enabled,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setPreviewColors(null);
        showToast(
          "Appearance Updated",
          enabled ? "Custom theme enabled." : "Default Gentlemen Savage theme restored.",
          "info"
        );
        return true;
      }
      return false;
    } catch {
      showToast("Error", "Could not toggle theme status.", "error");
      return false;
    }
  };

  const resetToDefault = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings/theme/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setPreviewColors(null);
        showToast("Reset Complete", "Default Gentlemen Savage theme restored.", "info");
        return true;
      }
      return false;
    } catch {
      showToast("Error", "Failed to reset theme.", "error");
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        isLoading,
        isCustomThemeEnabled,
        activeColors,
        previewColors,
        setPreviewColors,
        updateThemeColors,
        toggleCustomTheme,
        resetToDefault,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  settings: null,
  isLoading: false,
  isCustomThemeEnabled: false,
  activeColors: DEFAULT_THEME,
  previewColors: null,
  setPreviewColors: () => {},
  updateThemeColors: async () => false,
  toggleCustomTheme: async () => false,
  resetToDefault: async () => false,
  refreshSettings: async () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
}
