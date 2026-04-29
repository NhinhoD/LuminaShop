import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO } from '@/domain/entities/Category';
import { Result, ok, fail } from '@/domain/shared/Result';

export class CreateCategoryUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(data: CreateCategoryDTO): Promise<Result<Category>> {
    try {
      if (!data.name.trim()) {
        return fail(new Error('Tên danh mục không được để trống.'));
      }

      const existing = await this.categoryRepo.findBySlug(data.slug);
      if (existing) {
        return fail(new Error('Slug danh mục đã tồn tại.'));
      }

      const category = await this.categoryRepo.create(data);
      return ok(category);
    } catch (error: any) {
      console.error('CreateCategoryUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi tạo danh mục.'));
    }
  }
}
