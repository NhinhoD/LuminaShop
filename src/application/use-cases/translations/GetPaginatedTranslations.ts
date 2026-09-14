import { 
  ITranslationRepository, 
  PaginatedTranslations, 
  TranslationFilters 
} from '@/domain/repositories/ITranslationRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case to retrieve paginated translation entries with search and namespace filters.
 */
export class GetPaginatedTranslationsUseCase {
  constructor(private translationRepo: ITranslationRepository) {}

  /**
   * Retrieves paginated translation entries based on filters.
   *
   * @param filters - Optional filters including pagination range, search keyword, and namespace.
   * @returns Result containing paginated translation entries, total count, and available namespaces.
   */
  async execute(filters?: TranslationFilters): Promise<Result<PaginatedTranslations>> {
    try {
      const result = await this.translationRepo.getPaginatedTranslations(filters);
      return ok(result);
    } catch (error: unknown) {
      return fail(error instanceof Error ? error : new Error('Failed to retrieve paginated translations.'));
    }
  }
}
