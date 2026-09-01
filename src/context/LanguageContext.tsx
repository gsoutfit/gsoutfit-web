"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/types";
import { translations, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
  getLocalizedText: (enText: string, bnText?: string) => string;
}

const defaultContextValue: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey, fallback?: string) => {
    const item = translations[key];
    return item?.en || fallback || String(key);
  },
  getLocalizedText: (enText: string) => enText,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

const LANGUAGE_STORAGE_KEY = "gs_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang === "bn" || savedLang === "en") {
        setLanguageState(savedLang);
        if (typeof document !== "undefined") {
          document.documentElement.lang = savedLang;
        }
      } else {
        if (typeof document !== "undefined") {
          document.documentElement.lang = "en";
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const item = translations[key];
    if (!item) return fallback || String(key);
    return item[language] || item.en || fallback || String(key);
  };

  const getLocalizedText = (enText: string, bnText?: string): string => {
    if (language === "bn" && bnText && bnText.trim().length > 0) {
      return bnText;
    }
    return enText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getLocalizedText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context || defaultContextValue;
}
