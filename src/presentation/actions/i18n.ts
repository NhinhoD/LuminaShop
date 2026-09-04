"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { 
  makeAddTranslationUseCase, 
  makeUpdateTranslationUseCase, 
  makeDeleteTranslationUseCase, 
  makeTranslationRepository 
} from "@/infrastructure/supabase/container";
import { clearDictionaryCache } from "@/i18n/getDictionary";
import { vi } from "@/i18n/dictionaries/vi";
import { en } from "@/i18n/dictionaries/en";
import { TranslationEntry } from "@/domain/repositories/ITranslationRepository";
import { assertAdmin } from "./authGuards";

export async function setLanguageAction(locale: "vi" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
  clearDictionaryCache();
  revalidatePath("/", "layout");
}

export async function getTranslationsAction() {
  const repo = await makeTranslationRepository();
  return repo.getAllTranslations();
}

export async function addTranslationAction(key: string, namespace: string, vi: string, en: string) {
  try {
    await assertAdmin();
    const useCase = await makeAddTranslationUseCase();
    await useCase.execute(key, namespace, vi, en);
    clearDictionaryCache();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTranslationAction(key: string, vi: string, en: string) {
  try {
    await assertAdmin();
    const useCase = await makeUpdateTranslationUseCase();
    await useCase.execute(key, vi, en);
    clearDictionaryCache();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteTranslationAction(key: string) {
  try {
    await assertAdmin();
    const useCase = await makeDeleteTranslationUseCase();
    await useCase.execute(key);
    clearDictionaryCache();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function flattenDict(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      result[fullKey] = val;
    } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      Object.assign(result, flattenDict(val as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

export async function syncAllTranslationsAction() {
  try {
    await assertAdmin();
    const flatVi = flattenDict(vi as unknown as Record<string, unknown>);
    const flatEn = flattenDict(en as unknown as Record<string, unknown>);

    const allKeys = Array.from(new Set([...Object.keys(flatVi), ...Object.keys(flatEn)]));
    const entries: TranslationEntry[] = allKeys.map(key => {
      const namespace = key.split('.')[0] || 'common';
      return {
        key,
        namespace,
        vi: flatVi[key] || '',
        en: flatEn[key] || '',
      };
    });

    const repo = await makeTranslationRepository();
    await repo.upsertTranslations(entries);
    clearDictionaryCache();
    revalidatePath("/", "layout");
    return { success: true, count: entries.length };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to sync dictionary' };
  }
}
