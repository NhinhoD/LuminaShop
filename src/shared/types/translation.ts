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
