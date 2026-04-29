import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product, UpdateProductDTO } from '@/domain/entities/Product';
import { Result, ok, fail } from '@/domain/shared/Result';

export class UpdateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string, data: UpdateProductDTO): Promise<Result<Product>> {
    try {
      // Domain validation
      if (data.title && !data.title.trim()) {
        return fail(new Error('Tên sản phẩm không được để trống.'));
      }
      if (data.price !== undefined && data.price < 0) {
        return fail(new Error('Giá sản phẩm không được âm.'));
      }

      const product = await this.productRepo.update(id, data);
      return ok(product);
    } catch (error: any) {
      console.error('UpdateProductUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi cập nhật sản phẩm.'));
    }
  }
}
