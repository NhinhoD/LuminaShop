import { ILanguageRepository } from '@/domain/repositories/ILanguageRepository';

export class ToggleLanguageStatusUseCase {
  constructor(private languageRepository: ILanguageRepository) {}

  async execute(code: string, isActive: boolean): Promise<void> {
    // Optional: implement logic to update is_default / is_active
    // Currently, our repository just has findAll and findByCode
    // Add logic here when we add update to ILanguageRepository
    throw new Error('Not implemented');
  }
}
