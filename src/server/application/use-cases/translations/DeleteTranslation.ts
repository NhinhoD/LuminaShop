import { ITranslationRepository } from '@/server/domain/repositories/ITranslationRepository';

export class DeleteTranslationUseCase {
  constructor(private readonly translationRepo: ITranslationRepository) {}

  async execute(key: string): Promise<void> {
    await this.translationRepo.deleteTranslation(key);
  }
}
