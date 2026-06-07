"use server";

import { cookies } from "next/headers";
import { makeAddTranslationUseCase, makeUpdateTranslationUseCase, makeDeleteTranslationUseCase, makeTranslationRepository } from "@/infrastructure/supabase/container";
import { clearDictionaryCache } from "@/i18n/getDictionary";

export async function setLanguageAction(locale: "vi" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
}

export async function getTranslationsAction() {
  const repo = await makeTranslationRepository();
  return repo.getAllTranslations();
}

export async function addTranslationAction(key: string, namespace: string, vi: string, en: string) {
  try {
    const useCase = await makeAddTranslationUseCase();
    await useCase.execute(key, namespace, vi, en);
    clearDictionaryCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTranslationAction(key: string, vi: string, en: string) {
  try {
    const useCase = await makeUpdateTranslationUseCase();
    await useCase.execute(key, vi, en);
    clearDictionaryCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteTranslationAction(key: string) {
  try {
    const useCase = await makeDeleteTranslationUseCase();
    await useCase.execute(key);
    clearDictionaryCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
