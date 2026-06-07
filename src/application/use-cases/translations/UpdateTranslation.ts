import { ITranslationRepository } from '@/domain/repositories/ITranslationRepository';

export class UpdateTranslationUseCase {
  constructor(private readonly translationRepo: ITranslationRepository) {}

  async execute(key: string, vi: string, en: string): Promise<void> {
    await this.translationRepo.updateTranslation(key, vi, en);
  }
}
