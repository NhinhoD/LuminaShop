import { cookies } from "next/headers";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";

export type Locale = "vi" | "en";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

// Simple in-memory cache to avoid hitting the DB on every single render
let cachedDictionary: { vi: Record<string, unknown>; en: Record<string, unknown>; timestamp: number } | null = null;
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

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();

  try {
    const now = Date.now();
    // Check if we have a valid cache
    if (cachedDictionary && (now - cachedDictionary.timestamp) < CACHE_TTL_MS) {
      return cachedDictionary[locale] as Dictionary;
    }

    const repo = await makeLanguageRepository();
    const flatDict = await repo.fetchTranslations(locale);

    if (!flatDict || Object.keys(flatDict).length === 0) {
      return {};
    }

    const entries = Object.entries(flatDict).map(([key, text]) => ({ key, text }));
    const nestedDict = buildNestedDictionary(entries);

    // Update cache for the locale
    if (!cachedDictionary) {
      cachedDictionary = { vi: {}, en: {}, timestamp: now };
    }
    cachedDictionary[locale] = nestedDict;
    cachedDictionary.timestamp = now;

    return cachedDictionary[locale] as Dictionary;

  } catch (error) {
    console.error("Failed to load dictionary from Supabase:", error);
    return {};
  }
}

export function clearDictionaryCache() {
  cachedDictionary = null;
}
