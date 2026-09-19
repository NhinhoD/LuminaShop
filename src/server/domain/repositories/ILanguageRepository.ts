import { Language } from '../entities/Language';

export enum Locale {
  VI = 'vi',
  EN = 'en'
}

export interface ILanguageRepository {
  findAll(): Promise<Language[]>;
  findByCode(code: string): Promise<Language | null>;
  setDefaultLanguage(code: string): Promise<void>;
  fetchTranslations(locale: Locale): Promise<Record<string, string>>;
}
