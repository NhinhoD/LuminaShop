import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';

export class ToggleLanguageStatusUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string, isActive: boolean): Promise<void> {
    await this.languageRepository.toggleLanguageStatus(code, isActive);
  }
}
