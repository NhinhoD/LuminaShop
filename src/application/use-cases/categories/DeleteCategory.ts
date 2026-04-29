import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class DeleteCategoryUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.categoryRepo.delete(id);
      return ok(undefined);
    } catch (error: any) {
      console.error('DeleteCategoryUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi xóa danh mục.'));
    }
  }
}
