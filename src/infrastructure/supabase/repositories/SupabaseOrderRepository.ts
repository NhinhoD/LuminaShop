import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderItem, OrderStatus } from '@/domain/entities/Order';
import { createClient } from '@/infrastructure/supabase/server';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private supabase: any) {}

  async findById(id: string): Promise<Order | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(title))')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(title))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => this.mapToEntity(row));
  }

  async findAll(filters?: { status?: OrderStatus }): Promise<Order[]> {
    const supabase = this.supabase;
    let query = supabase.from('orders').select('*, order_items(*, product:products(title))');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => this.mapToEntity(row));
  }

  async create(order: any, items: any[]): Promise<Order> {
    const supabase = this.supabase;
    
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        status: OrderStatus.PENDING,
        total_amount: order.totalAmount,
        shipping_address: order.shippingAddress,
        contact_phone: order.contactPhone,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const itemsToInsert = items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw new Error(itemsError.message);

    return this.findById(orderData.id) as Promise<Order>;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToEntity(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status as OrderStatus,
      totalAmount: parseInt(row.total_amount),
      shippingAddress: row.shipping_address,
      contactPhone: row.contact_phone,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      items: (row.order_items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        priceAtPurchase: parseInt(item.price_at_purchase),
        productTitle: item.product?.title
      })),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
