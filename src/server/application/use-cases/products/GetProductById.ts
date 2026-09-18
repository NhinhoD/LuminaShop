import { IProductRepository } from '@/server/domain/repositories/IProductRepository';
import { Product } from '@/server/domain/entities/Product';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export class GetProductByIdUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string): Promise<Result<Product | null>> {
    try {
      const product = await this.productRepo.findById(id);
      return ok(product);
    } catch (error: unknown) {
      console.error('GetProductByIdUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy thông tin sản phẩm.'));
    }
  }
}
