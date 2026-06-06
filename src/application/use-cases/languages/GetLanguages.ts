import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';
import { Language } from '@/domain/entities/Language';

export class GetLanguagesUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(): Promise<Language[]> {
    return await this.languageRepository.findAll();
  }
}
