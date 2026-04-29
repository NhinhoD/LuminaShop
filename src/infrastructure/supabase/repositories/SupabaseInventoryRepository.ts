import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { InventoryItem, StockMovement } from '@/domain/entities/Inventory';
import { createClient } from '@/infrastructure/supabase/server';

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private supabase: any) {}

  async findByProductId(productId: string): Promise<InventoryItem[]> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_id', productId);
    
    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => this.mapToEntity(row));
  }

  async findByVariantId(variantId: string): Promise<InventoryItem | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('variant_id', variantId)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findBySku(sku: string): Promise<InventoryItem | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', sku)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async updateQuantity(id: string, delta: number): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase.rpc('increment_inventory_quantity', { 
      item_id: id, 
      delta 
    });

    if (error) throw new Error(error.message);
  }

  async reserve(id: string, quantity: number): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase.rpc('reserve_stock', { 
      item_id: id, 
      qty: quantity 
    });

    if (error) throw new Error(error.message);
  }

  async release(id: string, quantity: number): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase.rpc('release_stock', { 
      item_id: id, 
      qty: quantity 
    });

    if (error) throw new Error(error.message);
  }

  async addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<void> {
    // Optional: implement a movements table if needed for history
  }

  private mapToEntity(row: any): InventoryItem {
    return {
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      sku: row.sku,
      quantity: row.quantity,
      reserved: row.reserved,
      available: row.quantity - row.reserved,
      location: row.location,
      updatedAt: new Date(row.updated_at),
    };
  }
}
