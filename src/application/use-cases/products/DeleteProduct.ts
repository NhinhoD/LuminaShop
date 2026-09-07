import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

/**
 * Use case to delete a product by ID.
 */
export class DeleteProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  /**
   * Deletes a product from the repository.
   *
   * @param id - The ID of the product to delete.
   * @returns Result indicating success or error.
   */
  async execute(id: string): Promise<Result<void>> {
    try {
      await this.productRepo.delete(id);
      return ok(undefined);
    } catch (error: unknown) {
      console.error('DeleteProductUseCase Error:', error);
      return fail(new Error('Failed to delete product.'));
    }
  }
}
