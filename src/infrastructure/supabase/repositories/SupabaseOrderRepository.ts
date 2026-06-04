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
      .select('*, items:order_items(*, product:products(title))')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string, filters?: { limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }> {
    const supabase = this.supabase;
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(title))', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return {
      orders: (data as OrderRow[] || []).map((row) => this.mapToEntity(row)),
      total: count || 0
    };
  }

  async findAll(filters?: { status?: OrderStatus; limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }> {
    const supabase = this.supabase;
    let query = supabase.from('orders').select('*, items:order_items(*, product:products(title))', { count: 'exact' });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return {
      orders: (data as OrderRow[] || []).map((row) => this.mapToEntity(row)),
      total: count || 0
    };
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order> {
    const supabase = this.supabase;
    
    // Call atomic RPC for order creation and inventory deduction
    const { data, error } = await supabase.rpc('create_order_atomic', {
      order_data: {
        user_id: order.userId,
        status: order.status,
        total_amount: order.totalAmount,
        shipping_address: order.shippingAddress,
        contact_phone: order.contactPhone,
        contact_email: order.contactEmail,
        notes: order.notes,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus
      },
      items: items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        price_at_purchase: item.priceAtPurchase,
        product_snapshot: item.productSnapshot
      }))
    });

    if (error) {
      console.error('SupabaseOrderRepository.create error:', error);
      throw new Error(error.message || 'Không thể tạo đơn hàng do lỗi hệ thống hoặc hết hàng.');
    }

    const result = data as { order_id: string };
    const createdOrder = await this.findById(result.order_id);
    
    if (!createdOrder) {
      throw new Error('Đơn hàng đã được tạo nhưng không thể tìm thấy.');
    }

    return createdOrder;
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
    const updateData: { payment_status: string; updated_at: string; status?: string } = { 
      payment_status: paymentStatus, 
      updated_at: new Date().toISOString() 
    };
    
    if (paymentStatus === 'paid') {
      updateData.status = 'delivered'; // Immediately fulfill digital order
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToEntity(row: OrderRow): Order {
    const items = (row.items || []) as OrderItemRow[];

    return {
      id: row.id,
      userId: row.user_id || '',
      status: row.status as OrderStatus,
      totalAmount: typeof row.total_amount === 'string' ? parseInt(row.total_amount.toString()) : row.total_amount,
      shippingAddress: (typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address) as ShippingAddress,
      contactEmail: row.contact_email || undefined,
      contactPhone: row.contact_phone || undefined,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status as PaymentStatus,
      notes: row.notes || undefined,
      items: items.map((item) => ({
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
