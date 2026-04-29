import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { Result, ok, fail } from '@/domain/shared/Result';

export class ReserveStockUseCase {
  constructor(private inventoryRepo: IInventoryRepository) {}

  async execute(inventoryItemId: string, quantity: number): Promise<Result<void>> {
    try {
      if (quantity <= 0) return fail(new Error('Số lượng đặt trước phải lớn hơn 0.'));
      
      await this.inventoryRepo.reserve(inventoryItemId, quantity);
      return ok(undefined);
    } catch (error: any) {
      console.error('ReserveStockUseCase Error:', error);
      return fail(new Error(error.message || 'Không đủ hàng trong kho.'));
    }
  }
}
