import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product, CreateProductDTO } from '@/domain/entities/Product';
import { Result, ok, fail } from '@/domain/shared/Result';

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Result<Product>> {
    try {
      // Domain validation
      if (!data.title.trim()) {
        return fail(new Error('Tên sản phẩm không được để trống.'));
      }
      if (data.price < 0) {
        return fail(new Error('Giá sản phẩm không được âm.'));
      }
      if (data.stock < 0) {
        return fail(new Error('Số lượng tồn kho không được âm.'));
      }

      // Check for duplicate slug if provided
      if (data.slug) {
        const existing = await this.productRepo.findBySlug(data.slug);
        if (existing) {
          return fail(new Error('Slug sản phẩm đã tồn tại.'));
        }
      }

      const product = await this.productRepo.create(data);
      return ok(product);
    } catch (error: any) {
      console.error('CreateProductUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi tạo sản phẩm.'));
    }
  }
}
