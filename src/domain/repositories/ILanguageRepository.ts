import { Language } from '../entities/Language';

export interface ILanguageRepository {
  getAllLanguages(): Promise<Language[]>;
  getLanguageByCode(code: string): Promise<Language | null>;
  toggleLanguageStatus(code: string, isActive: boolean): Promise<void>;
}
