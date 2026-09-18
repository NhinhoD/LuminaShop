"use client";

import React, { createContext, useContext, useMemo } from "react";
import { vi } from "@/i18n/dictionaries/vi";
import { en } from "@/i18n/dictionaries/en";

export type Locale = "vi" | "en";

interface I18nContextType {
  locale: Locale;
  dict: typeof vi;
  t: (path: string, fallback?: string) => string;
}

const STATIC_DICTS: Record<Locale, typeof vi> = {
  vi: vi,
  en: en as unknown as typeof vi,
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  locale,
  customDict,
  children,
}: {
  locale: Locale;
  customDict?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const dict = useMemo(() => {
    const base = STATIC_DICTS[locale] || STATIC_DICTS.vi;
    if (!customDict) return base;
    return deepMerge(base as unknown as Record<string, unknown>, customDict) as typeof vi;
  }, [locale, customDict]);

  const t = useMemo(() => {
    return (path: string, fallback?: string): string => {
      const keys = path.split(".");
      let current: unknown = dict;
      for (const k of keys) {
        if (current && typeof current === "object" && k in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return fallback !== undefined ? fallback : path;
        }
      }
      return typeof current === "string" ? current : (fallback !== undefined ? fallback : path);
    };
  }, [dict]);

  return (
    <I18nContext.Provider value={{ locale, dict, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    const defaultLocale: Locale = "vi";
    const base = STATIC_DICTS[defaultLocale];
    return {
      locale: defaultLocale,
      dict: base,
      t: (path: string, fallback?: string) => fallback || path,
    };
  }
  return context;
}
