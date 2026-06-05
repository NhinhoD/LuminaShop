import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';
import { Language } from '@/domain/entities/Language';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseLanguageRepository implements ILanguageRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAllLanguages(): Promise<Language[]> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching languages:', error);
      return [];
    }

    return (data || []).map(this.mapToDomain);
  }

  async getLanguageByCode(code: string): Promise<Language | null> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDomain(data);
  }

  async toggleLanguageStatus(code: string, isActive: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('languages')
      .update({ is_active: isActive })
      .eq('code', code);

    if (error) {
      throw new Error(`Failed to toggle language status: ${error.message}`);
    }
  }

  private mapToDomain(data: { id?: string; code: string; name: string; is_active: boolean; is_default: boolean; created_at?: string; updated_at?: string }): Language {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      isActive: data.is_active,
      isDefault: data.is_default,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
