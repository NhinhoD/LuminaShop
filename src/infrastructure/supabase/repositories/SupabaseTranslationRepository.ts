import { ITranslationRepository, TranslationEntry, TranslationFilters, PaginatedTranslations } from '@/domain/repositories/ITranslationRepository';
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

  async getPaginatedTranslations(filters?: TranslationFilters): Promise<PaginatedTranslations> {
    // 1. Fetch unique namespaces for filter tabs via RPC with fallback
    let namespaces: string[] = [];
    const { data: rpcNs, error: rpcNsError } = await this.supabase.rpc('get_translation_namespaces');

    if (!rpcNsError && Array.isArray(rpcNs) && rpcNs.length > 0) {
      namespaces = rpcNs
        .map((r: { namespace?: string }) => r.namespace || '')
        .filter(Boolean)
        .sort();
    } else {
      const { data: nsData } = await this.supabase
        .from('site_translations')
        .select('namespace');

      namespaces = Array.from(
        new Set(
          (nsData || [])
            .map((r: { namespace?: string }) => r.namespace || 'common')
            .filter(Boolean)
        )
      ).sort();
    }

    // 2. Build filtered paginated query
    let query = this.supabase
      .from('site_translations')
      .select('key, namespace, vi, en', { count: 'exact' });

    if (filters?.namespace && filters.namespace !== 'all') {
      query = query.eq('namespace', filters.namespace);
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      const escapedTerm = term.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const pattern = `"%${escapedTerm}%"`;
      query = query.or(`key.ilike.${pattern},vi.ilike.${pattern},en.ilike.${pattern}`);
    }

    query = query.order('key', { ascending: true });

    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { translations: [], total: 0, namespaces };
    }

    return {
      translations: (data || []) as TranslationEntry[],
      total: count ?? (data?.length || 0),
      namespaces,
    };
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
