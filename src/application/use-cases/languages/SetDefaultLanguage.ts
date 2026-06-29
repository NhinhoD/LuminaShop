import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';

export class SetDefaultLanguageUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string): Promise<void> {
    try {
      await this.languageRepository.setDefaultLanguage(code);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to set default language');
    }
  }
}
