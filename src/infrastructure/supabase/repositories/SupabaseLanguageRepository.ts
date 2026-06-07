import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';
import { Language } from '@/domain/entities/Language';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseLanguageRepository implements ILanguageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Language[]> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .order('created_at');

    if (error) throw new Error(error.message);
    
    return (data || []).map(row => ({
      code: row.code,
      name: row.name,
      isDefault: row.is_default,
      createdAt: new Date(row.created_at)
    }));
  }

  async findByCode(code: string): Promise<Language | null> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return null;

    return {
      code: data.code,
      name: data.name,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at)
    };
  }

  async fetchTranslations(locale: 'vi' | 'en'): Promise<Record<string, string>> {
    const { data, error } = await this.supabase
      .from('site_translations')
      .select(`key, ${locale}`);

    if (error) {
      console.error('Error fetching translations:', error);
      return {};
    }

    const dict: Record<string, string> = {};
    if (data) {
      data.forEach((row: Record<string, string>) => {
        dict[row.key] = row[locale] || '';
      });
    }
    return dict;
  }
}
