import { InventoryItem, StockMovement } from '../entities/Inventory';

export interface IInventoryRepository {
  findByProductId(productId: string): Promise<InventoryItem[]>;
  findByVariantId(variantId: string): Promise<InventoryItem | null>;
  findBySku(sku: string): Promise<InventoryItem | null>;
  
  updateQuantity(id: string, delta: number): Promise<void>;
  reserve(id: string, quantity: number): Promise<void>;
  release(id: string, quantity: number): Promise<void>;
  
  addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<void>;
}
