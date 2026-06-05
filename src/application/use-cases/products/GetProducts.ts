import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { Result, ok, fail } from '@/domain/shared/Result';

export interface GetProductsDTO {
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export class GetProductsUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(dto: GetProductsDTO): Promise<Result<{ products: Product[]; total: number }>> {
    try {
      const data = await this.productRepo.findAll(dto);
      return ok(data);
    } catch (error: unknown) {
      console.error('GetProductsUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy danh sách sản phẩm.'));
    }
  }
}
