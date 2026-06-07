import { ITranslationRepository } from '@/domain/repositories/ITranslationRepository';

export class AddTranslationUseCase {
  constructor(private readonly translationRepo: ITranslationRepository) {}

  async execute(key: string, namespace: string, vi: string, en: string): Promise<void> {
    await this.translationRepo.addTranslation({ key, namespace, vi, en });
  }
}
