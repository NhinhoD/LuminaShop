import { ICartRepository } from '@/domain/repositories/ICartRepository';
import { Cart, CartItem } from '@/domain/entities/Cart';
import { createClient } from '@/infrastructure/supabase/server';

export class SupabaseCartRepository implements ICartRepository {
  constructor(private supabase: any) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const supabase = this.supabase;
    
    // Get cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (cartError || !cart) return null;

    // Get items with product details
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(title, price, image_url),
        variant:product_variants(name, price_adjustment)
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw new Error(itemsError.message);

    return {
      id: cart.id,
      userId: cart.user_id,
      items: (items || []).map((item: any) => ({
        id: item.id,
        cartId: item.cart_id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        productTitle: item.product?.title,
        productPrice: (item.product?.price || 0) + (item.variant?.price_adjustment || 0),
        productImageUrl: item.product?.image_url
      })),
      createdAt: new Date(cart.created_at),
      updatedAt: new Date(cart.updated_at)
    };
  }

  async create(userId: string): Promise<Cart> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      userId: data.user_id,
      items: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async addItem(cartId: string, item: Omit<CartItem, 'id' | 'cartId'>): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('cart_items')
      .upsert({
        cart_id: cartId,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity
      }, { onConflict: 'cart_id, product_id, variant_id' });

    if (error) throw new Error(error.message);
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  async removeItem(itemId: string): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  async clear(cartId: string): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw new Error(error.message);
  }
}
