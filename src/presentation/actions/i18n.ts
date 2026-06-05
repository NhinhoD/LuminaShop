"use server";

import { cookies } from "next/headers";
import { makeTranslationRepository } from "@/infrastructure/supabase/container";
import { clearDictionaryCache } from "@/i18n/getDictionary";

export async function setLanguageAction(locale: "vi" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
}

export async function updateTranslationAction(key: string, vi: string, en: string) {
  try {
    const repo = await makeTranslationRepository();
    await repo.updateTranslation(key, vi, en);
    clearDictionaryCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

