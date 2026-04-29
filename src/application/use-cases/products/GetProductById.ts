import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { Result, ok, fail } from '@/domain/shared/Result';

export class GetProductByIdUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string): Promise<Result<Product>> {
    try {
      const product = await this.productRepo.findById(id);
      if (!product) {
        return fail(new Error('Không tìm thấy sản phẩm.'));
      }
      return ok(product);
    } catch (error: any) {
      console.error('GetProductByIdUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi lấy thông tin sản phẩm.'));
    }
  }
}
