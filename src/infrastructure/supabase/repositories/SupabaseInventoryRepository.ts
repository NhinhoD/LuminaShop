import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { InventoryItem, StockMovement } from '@/domain/entities/Inventory';
import { InventoryItemRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByProductId(productId: string): Promise<InventoryItem[]> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_id', productId);
    
    if (error) throw new Error(error.message);
    return (data as InventoryItemRow[] || []).map((row) => this.mapToEntity(row));
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

  async findBaseInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_id', productId)
      .is('variant_id', null)
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

  async addMovement(_movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<void> {
    // Optional: implement a movements table if needed for history
  }

  private mapToEntity(row: InventoryItemRow): InventoryItem {
    return {
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id || undefined,
      sku: row.sku,
      quantity: row.quantity,
      reserved: row.reserved,
      available: row.quantity - row.reserved,
      location: row.location || undefined,
      updatedAt: new Date(row.updated_at),
    };
  }
}
