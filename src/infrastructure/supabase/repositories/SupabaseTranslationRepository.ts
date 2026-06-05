import { ITranslationRepository, TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseTranslationRepository implements ITranslationRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAllTranslations(): Promise<TranslationEntry[]> {
    const { data, error } = await this.supabase
      .from('site_translations')
      .select('*');

    if (error) {
      console.error('Error fetching translations:', error);
      return [];
    }

    return data as TranslationEntry[];
  }

  async updateTranslation(key: string, vi: string, en: string): Promise<void> {
    const { error } = await this.supabase
      .from('site_translations')
      .update({ vi, en, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) {
      throw new Error(`Failed to update translation: ${error.message}`);
    }
  }
}
