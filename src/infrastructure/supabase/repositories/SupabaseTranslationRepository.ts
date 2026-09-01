import { ITranslationRepository, TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseTranslationRepository implements ITranslationRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAllTranslations(): Promise<TranslationEntry[]> {
    const { data, error } = await this.supabase
      .from('site_translations')
      .select('*');

    if (error) {
      return [];
    }

    return data as TranslationEntry[];
  }

  async updateTranslation(key: string, vi: string, en: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('site_translations')
      .update({ vi, en, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select();

    if (error) {
      throw new Error(`Failed to update translation: ${error.message}`);
    }

    if (!data || data.length === 0) {
      const namespace = key.split('.')[0] || 'common';
      const { error: insertError } = await this.supabase
        .from('site_translations')
        .insert({
          key,
          namespace,
          vi,
          en,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Failed to insert translation: ${insertError.message}`);
      }
    }
  }

  async addTranslation(entry: TranslationEntry): Promise<void> {
    const { error } = await this.supabase
      .from('site_translations')
      .insert({ ...entry, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

    if (error) {
      throw new Error(`Failed to add translation: ${error.message}`);
    }
  }

  async deleteTranslation(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('site_translations')
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`Failed to delete translation: ${error.message}`);
    }
  }

  async upsertTranslations(entries: TranslationEntry[]): Promise<void> {
    if (!entries || entries.length === 0) return;

    const formatted = entries.map(e => ({
      key: e.key,
      namespace: e.namespace,
      vi: e.vi,
      en: e.en,
      updated_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('site_translations')
      .upsert(formatted, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to bulk upsert translations: ${error.message}`);
    }
  }
}
