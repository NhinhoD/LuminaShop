import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order, OrderItem, OrderStatus, PaymentStatus, ShippingAddress, ProductSnapshot } from '@/domain/entities/Order';
import { OrderRow, OrderItemRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private supabase: SupabaseClient) {}

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
    return (data as OrderRow[] || []).map((row) => this.mapToEntity(row));
  }

  async findAll(filters?: { status?: OrderStatus }): Promise<Order[]> {
    const supabase = this.supabase;
    let query = supabase.from('orders').select('*, order_items(*, product:products(title))');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as OrderRow[] || []).map((row) => this.mapToEntity(row));
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order> {
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
        contact_email: order.contactEmail,
        notes: order.notes,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const itemsToInsert = items.map((item) => ({
      order_id: (orderData as OrderRow).id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase,
      product_snapshot: item.productSnapshot
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

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToEntity(row: OrderRow): Order {
    return {
      id: row.id,
      userId: row.user_id || '',
      status: row.status as OrderStatus,
      totalAmount: typeof row.total_amount === 'string' ? parseInt(row.total_amount) : row.total_amount,
      shippingAddress: (typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address) as ShippingAddress,
      contactEmail: row.contact_email || undefined,
      contactPhone: row.contact_phone || undefined,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status as PaymentStatus,
      notes: row.notes || undefined,
      items: (row.items || []).map((item) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        variantId: item.variant_id || undefined,
        quantity: item.quantity,
        priceAtPurchase: typeof item.price_at_purchase === 'string' ? parseInt(item.price_at_purchase) : item.price_at_purchase,
        productTitle: item.product?.title,
        productSnapshot: (typeof item.product_snapshot === 'string' ? JSON.parse(item.product_snapshot) : item.product_snapshot) as ProductSnapshot
      })),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
