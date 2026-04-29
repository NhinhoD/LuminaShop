import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { Result, ok, fail } from '@/domain/shared/Result';

export class GetProductsUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(filters?: { 
    categoryId?: string; 
    search?: string; 
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Result<{ products: Product[]; total: number }>> {
    try {
      const data = await this.productRepo.findAll(filters);
      return ok(data);
    } catch (error: any) {
      console.error('GetProductsUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy danh sách sản phẩm.'));
    }
  }
}
