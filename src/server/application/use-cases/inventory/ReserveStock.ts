import { IInventoryRepository } from '@/server/domain/repositories/IInventoryRepository';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export class ReserveStockUseCase {
  constructor(private inventoryRepo: IInventoryRepository) {}

  async execute(inventoryItemId: string, quantity: number): Promise<Result<void>> {
    try {
      if (quantity <= 0) return fail(new Error('Số lượng đặt trước phải lớn hơn 0.'));
      
      await this.inventoryRepo.reserve(inventoryItemId, quantity);
      return ok(undefined);
    } catch (error: unknown) {
      console.error('ReserveStockUseCase Error:', error);
      const message = error instanceof Error ? error.message : 'Không đủ hàng trong kho.';
      return fail(new Error(message));
    }
  }
}
