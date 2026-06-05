import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category } from '@/domain/entities/Category';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetCategoriesDTO {
  limit?: number;
  offset?: number;
  search?: string;
}

export class GetCategoriesUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(dto?: GetCategoriesDTO): Promise<Result<{ categories: Category[], total: number }>> {
    try {
      const result = await this.categoryRepo.findAll(dto);
      return ok(result);
    } catch (error: unknown) {
      console.error('GetCategoriesUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy danh sách danh mục.'));
    }
  }
}
