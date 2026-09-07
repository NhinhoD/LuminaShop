import { ITranslationRepository, TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case to retrieve all translation entries from the repository.
 */
export class GetTranslationsUseCase {
  constructor(private translationRepo: ITranslationRepository) {}

  /**
   * Retrieves all translation entries.
   *
   * @returns Result containing an array of TranslationEntry.
   */
  async execute(): Promise<Result<TranslationEntry[]>> {
    try {
      const translations = await this.translationRepo.getAllTranslations();
      return ok(translations);
    } catch (error: unknown) {
      console.error('GetTranslationsUseCase Error:', error);
      return fail(new Error('Failed to retrieve translations.'));
    }
  }
}
