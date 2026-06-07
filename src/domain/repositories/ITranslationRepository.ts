export interface TranslationEntry {
  key: string;
  vi: string;
  en: string;
  namespace: string;
}

export interface ITranslationRepository {
  getAllTranslations(): Promise<TranslationEntry[]>;
  updateTranslation(key: string, vi: string, en: string): Promise<void>;
  addTranslation(entry: TranslationEntry): Promise<void>;
  deleteTranslation(key: string): Promise<void>;
}
