export interface TranslationEntry {
  key: string;
  vi: string;
  en: string;
  namespace: string;
}

export interface TranslationFilters {
  limit?: number;
  offset?: number;
  search?: string;
  namespace?: string;
}

export interface PaginatedTranslations {
  translations: TranslationEntry[];
  total: number;
  namespaces: string[];
}

export interface ITranslationRepository {
  getAllTranslations(): Promise<TranslationEntry[]>;
  getPaginatedTranslations(filters?: TranslationFilters): Promise<PaginatedTranslations>;
  updateTranslation(key: string, vi: string, en: string): Promise<void>;
  addTranslation(entry: TranslationEntry): Promise<void>;
  deleteTranslation(key: string): Promise<void>;
  upsertTranslations(entries: TranslationEntry[]): Promise<void>;
}
