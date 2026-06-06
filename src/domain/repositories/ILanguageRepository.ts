import { Language } from '../entities/Language';

export interface ILanguageRepository {
  findAll(): Promise<Language[]>;
  findByCode(code: string): Promise<Language | null>;
}
