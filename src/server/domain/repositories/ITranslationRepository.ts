export * from '@/shared/types/translation';
import type { TranslationEntry, TranslationFilters, PaginatedTranslations } from '@/shared/types/translation';

export interface ITranslationRepository {
  getAllTranslations(): Promise<TranslationEntry[]>;
  getPaginatedTranslations(filters?: TranslationFilters): Promise<PaginatedTranslations>;
  updateTranslation(key: string, vi: string, en: string): Promise<void>;
  addTranslation(entry: TranslationEntry): Promise<void>;
  deleteTranslation(key: string): Promise<void>;
  upsertTranslations(entries: TranslationEntry[]): Promise<void>;
}
