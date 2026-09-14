import { IOrderRepository, PurchasedTemplateItem, UserPurchasedTemplatesResult } from '@/domain/repositories/IOrderRepository';
import { Order, OrderItem, OrderStatus, PaymentStatus, ShippingAddress, ProductSnapshot, PaymentMethod } from '@/domain/entities/Order';
import { Product } from '@/domain/entities/Product';
import { OrderRow, OrderItemRow, ProductRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

interface RawPurchasedTemplateRow {
  id: string;
  product_id: string;
  price_at_purchase: string | number;
  created_at: string;
  order_id: string;
  products: ProductRow;
  orders: {
    created_at?: string;
  } | null;
}

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

  /**
   * Retrieves orders belonging to a specific customer with optional limit, offset, and ID search filtering.
   *
   * @param userId - The ID of the customer.
   * @param filters - Optional pagination limit, offset, and search term.
   * @returns An object containing mapped Order entities and the total count.
   */
  async findByUserId(userId: string, filters?: { limit?: number; offset?: number; search?: string }): Promise<{ orders: Order[], total: number }> {
    const supabase = this.supabase;
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(title))', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.search) {
      query = query.ilike('id', `%${filters.search}%`);
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

  async findAll(filters?: { status?: OrderStatus; limit?: number; offset?: number; search?: string }): Promise<{ orders: Order[], total: number }> {
    const supabase = this.supabase;
    let query = supabase.from('orders').select('*, items:order_items(*, product:products(title))', { count: 'exact' });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      // Search by ID or customer name.
      query = query.or(`id.ilike.%${filters.search}%,shipping_address->>fullName.ilike.%${filters.search}%`);
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
    
    if (paymentStatus === 'paid') {
      // Use atomic SECURITY DEFINER RPC to bypass user-level RLS restrictions and fulfill immediately
      const { error: rpcError } = await supabase.rpc('complete_order_payment', {
        p_order_id: id
      });
      
      if (!rpcError) return;
      console.warn('[SupabaseOrderRepository] complete_order_payment RPC failed, falling back to direct update:', rpcError.message);
    }

    const updateData: { payment_status: string; updated_at: string; status?: string } = { 
      payment_status: paymentStatus, 
      updated_at: new Date().toISOString() 
    };
    
    if (paymentStatus === 'paid') {
      updateData.status = 'completed'; // Immediately fulfill digital order
    }

    let query = supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    // When marking as paid in fallback, preserve cancellation predicate: require status = pending and payment_status != paid
    if (paymentStatus === 'paid') {
      query = query
        .eq('status', OrderStatus.PENDING)
        .neq('payment_status', 'paid');
    }

    const { data: updated, error } = await query.select('id');

    if (error) throw new Error(error.message);
    if (paymentStatus === 'paid' && (!updated || updated.length === 0)) {
      throw new Error('Không thể cập nhật trạng thái thanh toán. Đơn hàng không ở trạng thái chờ thanh toán hoặc đã bị hủy.');
    }
  }

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('order_items')
      .select('order_id, orders!inner(user_id, payment_status)')
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .eq('orders.payment_status', 'paid')
      .neq('orders.status', 'cancelled')
      .limit(1);

    if (error || !data) return false;
    return data.length > 0;
  }

  /**
   * Atomically cancels a pending unpaid order.
   * Enforces that the order status must be PENDING and payment_status must not be 'paid'.
   *
   * @param id - The unique ID of the order to cancel.
   * @returns Promise resolving to true if cancelled, or false if already paid/cancelled or error.
   */
  async cancelPendingOrder(id: string): Promise<boolean> {
    // 1. Try atomic PostgreSQL RPC with SECURITY DEFINER
    const { data, error } = await this.supabase.rpc('cancel_pending_order', {
      p_order_id: id
    });

    if (!error && data) {
      return data.success === true;
    }

    // 2. Fallback: atomic conditional update enforcing pending and unpaid preconditions
    const { data: updated, error: updateError } = await this.supabase
      .from('orders')
      .update({ status: OrderStatus.CANCELLED, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', OrderStatus.PENDING)
      .neq('payment_status', 'paid')
      .select('id');

    if (updateError || !updated || updated.length === 0) {
      return false;
    }

    return true;
  }

  async findUserPurchasedTemplates(
    userId: string,
    options?: { limit?: number; offset?: number; search?: string }
  ): Promise<UserPurchasedTemplatesResult> {
    const limit = options?.limit ?? 9;
    const offset = options?.offset ?? 0;

    let query = this.supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        price_at_purchase,
        created_at,
        order_id,
        products!inner (*),
        orders!inner (
          status,
          payment_status,
          user_id,
          created_at
        )
      `, { count: 'exact' })
      .eq('orders.user_id', userId)
      .neq('orders.status', 'cancelled')
      .or('payment_status.eq.paid,status.eq.completed,status.eq.delivered', { referencedTable: 'orders' });

    if (options?.search) {
      const escapedSearch = options.search.replace(/\\/g, '\\\\').replace(/[,()]/g, '\\$&');
      query = query.or(`title->>vi.ilike.%${escapedSearch}%,title->>en.ilike.%${escapedSearch}%`, { referencedTable: 'products' });
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user purchased templates: ${error.message}`);
    }

    if (!data) {
      return { items: [], total: 0 };
    }

    const rawRows = data as unknown as RawPurchasedTemplateRow[];
    const items: PurchasedTemplateItem[] = rawRows.map((row) => {
      const prod = row.products;
      const productEntity: Product = {
        id: prod.id,
        categoryId: prod.category_id,
        title: prod.title || { vi: '', en: '' },
        slug: prod.slug,
        description: prod.description || { vi: '', en: '' },
        price: typeof prod.price === 'string' ? parseInt(prod.price) : prod.price,
        stock: prod.stock,
        imageUrl: prod.image_url || undefined,
        isActive: prod.is_active,
        demoUrl: prod.demo_url || '',
        sourceCodeUrl: prod.source_code_url || '',
        techStack: prod.tech_stack || [],
        createdAt: new Date(prod.created_at),
        updatedAt: new Date(prod.updated_at),
      };

      return {
        id: row.id,
        productId: row.product_id,
        priceAtPurchase: typeof row.price_at_purchase === 'string' ? parseInt(row.price_at_purchase) : row.price_at_purchase,
        createdAt: new Date(row.created_at),
        orderId: row.order_id,
        orderCreatedAt: row.orders?.created_at ? new Date(row.orders.created_at) : undefined,
        product: productEntity,
      };
    });

    return {
      items,
      total: count || items.length,
    };
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
      paymentMethod: row.payment_method as PaymentMethod,
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
