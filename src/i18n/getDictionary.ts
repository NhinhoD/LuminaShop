import { cookies } from "next/headers";
import { ILanguageRepository, Locale as DomainLocale } from "@/domain/repositories/ILanguageRepository";
import { vi } from "./dictionaries/vi";
import { en } from "./dictionaries/en";

export type Locale = "vi" | "en";

export interface Dictionary {
  [key: string]: string | Dictionary;
}

export const STATIC_DICTIONARIES: Record<Locale, Dictionary> = {
  vi: vi as unknown as Dictionary,
  en: en as unknown as Dictionary,
};

export function getStaticDictionary(locale: Locale): Dictionary {
  return STATIC_DICTIONARIES[locale] || STATIC_DICTIONARIES.vi;
}

// Simple in-memory cache to avoid hitting the DB on every single render
const cache: Record<Locale, { data: Record<string, unknown> | null; timestamp: number }> = {
  vi: { data: null, timestamp: 0 },
  en: { data: null, timestamp: 0 },
};
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Deep merge utility for dictionaries
 */
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

/**
 * Helper to build a nested dictionary object from flat translation entries.
 * e.g., 'home.hero.title' -> { home: { hero: { title: '...' } } }
 */
function buildNestedDictionary(entries: { key: string; text: string }[]): Record<string, unknown> {
  const dict: Record<string, unknown> = {};
  for (const entry of entries) {
    if (!entry.text) continue;
    const keys = entry.key.split(".");
    let current = dict;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = entry.text;
  }
  return dict;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "vi";
}

export async function getDictionary(repo?: ILanguageRepository): Promise<Dictionary> {
  const locale = await getLocale();
  const baseDict = getStaticDictionary(locale);

  if (!repo) {
    return baseDict;
  }

  try {
    const now = Date.now();
    // Check if we have a valid cache
    if (cache[locale].data && now - cache[locale].timestamp < CACHE_TTL_MS) {
      return cache[locale].data as Dictionary;
    }

    const flatDict = await repo.fetchTranslations(
      locale === "vi" ? DomainLocale.VI : DomainLocale.EN
    );

    if (!flatDict || Object.keys(flatDict).length === 0) {
      return baseDict;
    }

    const entries = Object.entries(flatDict).map(([key, text]) => ({ key, text }));
    const nestedDbDict = buildNestedDictionary(entries);

    const mergedDict = deepMerge(
      baseDict as unknown as Record<string, unknown>,
      nestedDbDict
    ) as Dictionary;

    // Update cache for the locale
    cache[locale].data = mergedDict as Record<string, unknown>;
    cache[locale].timestamp = now;

    return mergedDict;
  } catch {
    return baseDict;
  }
}

export function clearDictionaryCache(): void {
  cache.vi = { data: null, timestamp: 0 };
  cache.en = { data: null, timestamp: 0 };
}
