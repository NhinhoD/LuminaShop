import { ITranslationRepository, TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case to bulk sync translation entries into the database.
 */
export class SyncTranslationsUseCase {
  constructor(private translationRepo: ITranslationRepository) {}

  /**
   * Upserts multiple translation entries.
   *
   * @param entries - Array of TranslationEntry objects to sync.
   * @returns Result indicating success or error.
   */
  async execute(entries: TranslationEntry[]): Promise<Result<void>> {
    try {
      await this.translationRepo.upsertTranslations(entries);
      return ok(undefined);
    } catch (error: unknown) {
      console.error('SyncTranslationsUseCase Error:', error);
      return fail(new Error('Failed to sync translations.'));
    }
  }
}
