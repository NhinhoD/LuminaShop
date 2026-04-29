import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ReleaseStockUseCase {
  constructor(private inventoryRepo: IInventoryRepository) {}

  async execute(inventoryItemId: string, quantity: number): Promise<Result<void>> {
    try {
      if (quantity <= 0) return fail(new Error('Số lượng giải phóng phải lớn hơn 0.'));
      
      await this.inventoryRepo.release(inventoryItemId, quantity);
      return ok(undefined);
    } catch (error: any) {
      console.error('ReleaseStockUseCase Error:', error);
      return fail(new Error('Đã có lỗi xảy ra khi giải phóng kho hàng.'));
    }
  }
}
