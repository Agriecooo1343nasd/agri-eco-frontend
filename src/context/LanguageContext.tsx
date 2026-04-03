"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type LanguageCode = "en" | "rw" | "fr" | "sw";

export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

interface LanguageContextType {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (data: MultiLangText | string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LanguageCode>("en");

  // Load locale from localStorage on mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(
        "agri-eco-locale",
      ) as LanguageCode;
      if (savedLocale && ["en", "rw", "fr", "sw"].includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    } catch (err) {
      console.warn("Language storage access failed:", err);
    }
  }, []);

  const setLocale = (newLocale: LanguageCode) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("agri-eco-locale", newLocale);
    } catch (err) {
      console.warn("Could not save language to localStorage:", err);
    }
  };

  /**
   * Translation utility with fallback logic:
   * 1. Target Locale
   * 2. English (en)
   * 3. First available key in the object
   * 4. Empty string
   */
  const t = useCallback(
    (data: MultiLangText | string | undefined): string => {
      if (!data) return "";

      if (typeof data === "string") return data;

      // 1. Try target locale
      if (data[locale]) return data[locale] as string;

      // 2. Try English
      if (data.en) return data.en;

      // 3. Try any available key
      const keys = Object.keys(data) as (keyof MultiLangText)[];
      for (const key of keys) {
        if (data[key]) return data[key] as string;
      }

      return "";
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
