import { ICategoryRepository } from '@/server/domain/repositories/ICategoryRepository';
import { IProductRepository } from '@/server/domain/repositories/IProductRepository';
import { Result, ok, fail } from '@/server/domain/shared/Result';

/**
 * Use case to delete (soft delete) a category.
 * Prevents deletion if the category still contains active (non-deleted) products.
 */
export class DeleteCategoryUseCase {
  constructor(
    private categoryRepo: ICategoryRepository,
    private productRepo: IProductRepository
  ) {}

  /**
   * Executes the deletion of a category.
   *
   * @param id - The ID of the category to delete.
   * @returns Result indicating success or error.
   */
  async execute(id: string): Promise<Result<void>> {
    try {
      const category = await this.categoryRepo.findById(id);
      if (!category) {
        return fail(new Error('Danh mục không tồn tại.'));
      }

      // Check if there are active products belonging to this category
      const { total } = await this.productRepo.findAll({
        categoryId: id,
        limit: 1,
      });

      if (total > 0) {
        return fail(
          new Error(
            'Không thể xóa danh mục đang có sản phẩm hoạt động. Vui lòng chuyển danh mục hoặc xóa sản phẩm trước.'
          )
        );
      }

      await this.categoryRepo.delete(id);
      return ok(undefined);
    } catch (error: unknown) {
      console.error('DeleteCategoryUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi xóa danh mục.'));
    }
  }
}

