import { Cart, CartItem } from '../entities/Cart';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  create(userId: string): Promise<Cart>;
  addItem(cartId: string, item: Omit<CartItem, 'id' | 'cartId'>): Promise<void>;
  updateItem(itemId: string, quantity: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clear(cartId: string): Promise<void>;
}
