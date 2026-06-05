'use server';

import { makeGetLanguagesUseCase, makeToggleLanguageStatusUseCase } from '@/infrastructure/supabase/container';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Language } from '@/domain/entities/Language';

export async function getLanguagesAction(): Promise<Language[]> {
  try {
    const useCase = await makeGetLanguagesUseCase();
    return await useCase.execute();
  } catch (error) {
    console.error('Failed to get languages:', error);
    return [];
  }
}

export async function toggleLanguageAction(code: string, isActive: boolean) {
  try {
    const useCase = await makeToggleLanguageStatusUseCase();
    await useCase.execute(code, isActive);
    revalidatePath('/admin/languages');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to toggle language status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function setLocaleCookieAction(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
