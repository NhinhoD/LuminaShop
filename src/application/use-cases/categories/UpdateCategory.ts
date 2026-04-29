import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category, UpdateCategoryDTO } from '@/domain/entities/Category';
import { Result, ok, fail } from '@/domain/shared/Result';

export class UpdateCategoryUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(id: string, data: UpdateCategoryDTO): Promise<Result<Category>> {
    try {
      if (data.name !== undefined && !data.name.trim()) {
        return fail(new Error('Tên danh mục không được để trống.'));
      }

      if (data.slug) {
        const existing = await this.categoryRepo.findBySlug(data.slug);
        if (existing && existing.id !== id) {
          return fail(new Error('Slug danh mục đã tồn tại.'));
        }
      }

      const category = await this.categoryRepo.update(id, data);
      return ok(category);
    } catch (error: any) {
      console.error('UpdateCategoryUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi cập nhật danh mục.'));
    }
  }
}
