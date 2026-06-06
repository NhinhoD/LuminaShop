import { cookies } from "next/headers";
import { vi as fallbackVi } from "./dictionaries/vi";
import { en as fallbackEn } from "./dictionaries/en";
import { makeTranslationRepository } from "@/infrastructure/supabase/container";

export type Locale = "vi" | "en";
export type Dictionary = typeof fallbackVi; // Maintain the same type structure

const fallbackDictionaries: Record<Locale, Dictionary> = {
  vi: fallbackVi,
  en: fallbackEn,
};

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

// Simple in-memory cache to avoid hitting the DB on every single render
let cachedDictionary: { vi: Record<string, unknown>; en: Record<string, unknown>; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "vi";
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();

  try {
    const now = Date.now();
    // Check if we have a valid cache
    if (cachedDictionary && (now - cachedDictionary.timestamp) < CACHE_TTL_MS) {
      // Merge cached DB dictionary over the fallback to ensure no missing keys
      return {
        ...fallbackDictionaries[locale],
        ...(cachedDictionary[locale] || {})
      } as Dictionary;
    }

    const repo = await makeTranslationRepository();
    const entries = await repo.getAllTranslations();

    if (!entries || entries.length === 0) {
      return fallbackDictionaries[locale];
    }

    const viEntries = entries.map(e => ({ key: e.key, text: e.vi }));
    const enEntries = entries.map(e => ({ key: e.key, text: e.en }));

    cachedDictionary = {
      vi: buildNestedDictionary(viEntries),
      en: buildNestedDictionary(enEntries),
      timestamp: now
    };

    // Deep merge DB dictionary over fallback dictionary
    return {
      ...fallbackDictionaries[locale],
      ...(cachedDictionary[locale] || {})
    } as Dictionary;

  } catch (error) {
    console.error("Failed to load dictionary from Supabase, falling back to static files:", error);
    return fallbackDictionaries[locale];
  }
}

export function clearDictionaryCache() {
  cachedDictionary = null;
}
