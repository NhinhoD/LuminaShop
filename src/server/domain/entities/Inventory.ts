export interface InventoryItem {
  id: string;
  productId?: string;
  variantId?: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  location?: string;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUST';
  quantity: number;
  reason?: string;
  createdAt: Date;
}
