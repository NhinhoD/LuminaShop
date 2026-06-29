import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';

export class ToggleLanguageStatusUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string, isActive: boolean): Promise<void> {
    // isActive is ignored here because we are only setting default language from UI
    await this.languageRepository.setDefaultLanguage(code);
  }
}
