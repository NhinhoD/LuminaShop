import { cookies } from "next/headers";
import { ILanguageRepository, Locale as DomainLocale } from "@/domain/repositories/ILanguageRepository";

export type Locale = "vi" | "en";

export interface Dictionary {
  [key: string]: string | Dictionary;
}

const DEFAULT_ADMIN_DICTIONARY: Dictionary = {
  dashboard: {},
  products: {},
  home: {}
};

// Simple in-memory cache to avoid hitting the DB on every single render
const cache: Record<Locale, { data: Record<string, unknown> | null; timestamp: number }> = {
  vi: { data: null, timestamp: 0 },
  en: { data: null, timestamp: 0 }
};
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache
/**
 * Helper to build a nested dictionary object from flat translation entries.
 * e.g., 'home.hero.title' -> { home: { hero: { title: '...' } } }
 */
function buildNestedDictionary(entries: { key: string; text: string }[]): Record<string, unknown> {
  const dict: Record<string, unknown> = {};
  for (const entry of entries) {
    const keys = entry.key.split('.');
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

export async function getDictionary(repo: ILanguageRepository): Promise<Dictionary> {
  const locale = await getLocale();

  try {
    const now = Date.now();
    // Check if we have a valid cache
    if (cache[locale].data && (now - cache[locale].timestamp) < CACHE_TTL_MS) {
      return cache[locale].data as Dictionary;
    }

    const flatDict = await repo.fetchTranslations(locale === 'vi' ? DomainLocale.VI : DomainLocale.EN);

    if (!flatDict || Object.keys(flatDict).length === 0) {
      return DEFAULT_ADMIN_DICTIONARY;
    }

    const entries = Object.entries(flatDict).map(([key, text]) => ({ key, text }));
    const nestedDict = buildNestedDictionary(entries) as Dictionary;

    const mergedDict = { ...DEFAULT_ADMIN_DICTIONARY, ...nestedDict };

    // Update cache for the locale
    cache[locale].data = mergedDict as Record<string, unknown>;
    cache[locale].timestamp = now;

    return mergedDict;

  } catch (error) {
    console.error("Failed to load dictionary from Supabase:", error);
    return DEFAULT_ADMIN_DICTIONARY;
  }
}

export function clearDictionaryCache(): void {
  cache.vi = { data: null, timestamp: 0 };
  cache.en = { data: null, timestamp: 0 };
}
