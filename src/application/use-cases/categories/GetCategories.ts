import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category } from '@/domain/entities/Category';
import { Result, ok, fail } from '@/domain/shared/Result';

export class GetCategoriesUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(): Promise<Result<Category[]>> {
    try {
      const categories = await this.categoryRepo.findAll();
      return ok(categories);
    } catch (error: any) {
      console.error('GetCategoriesUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy danh sách danh mục.'));
    }
  }
}
