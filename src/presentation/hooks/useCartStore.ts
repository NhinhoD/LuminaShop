import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  addToCartAction, 
  updateCartItemAction, 
  removeCartItemAction, 
  getCartAction
} from '@/presentation/actions/cart';

import { CartItem as DomainCartItem } from '@/domain/entities/Cart';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  title: Record<string, string>;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  setGuestStatus: (isGuest: boolean) => void;
  syncWithServer: () => Promise<void>;
  addItem: (item: { productId: string, variantId?: string, variantName?: string, quantity: number, title?: Record<string, string>, price?: number, imageUrl?: string }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const isGuest = window.localStorage.getItem('cart-is-guest') !== 'false';
    if (isGuest) return window.sessionStorage.getItem(name);
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const state = JSON.parse(value);
      const isGuest = state.state.isGuest;
      window.localStorage.setItem('cart-is-guest', String(isGuest));
      if (isGuest) {
        window.sessionStorage.setItem(name, value);
        window.localStorage.removeItem(name);
      } else {
        window.localStorage.setItem(name, value);
        window.sessionStorage.removeItem(name);
      }
    } catch (_e) {
      window.sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(name);
    window.localStorage.removeItem(name);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      isGuest: true,
      
      setGuestStatus: (isGuest: boolean) => {
        set({ isGuest });
      },

      syncWithServer: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await getCartAction();
          if (result.data) {
            const mappedItems: CartItem[] = result.data.items.map((i: DomainCartItem) => ({
              id: i.id,
              productId: i.productId,
              variantId: i.variantId,
              variantName: i.variantName ?? undefined,
              title: i.productTitle || { vi: '', en: '' },
              price: i.productPrice || 0,
              imageUrl: i.productImageUrl,
              quantity: i.quantity
            }));
            set({ items: mappedItems, isGuest: false });
          } else {
            // Not logged in or error getting cart
            set({ isGuest: true });
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        const { isGuest, items } = get();
        set({ isLoading: true, error: null });
        
        try {
          if (!isGuest) {
            // Logged in
            const result = await addToCartAction({ 
              productId: item.productId, 
              variantId: item.variantId, 
              quantity: item.quantity 
            });
            if (result.error) {
              set({ error: result.error });
            } else {
              await get().syncWithServer();
            }
          } else {
            // Guest logic
            const existingItem = items.find(i => i.productId === item.productId && i.variantId === item.variantId);
            if (existingItem) {
               set({
                 items: items.map(i => i.productId === item.productId && i.variantId === item.variantId 
                   ? { ...i, quantity: i.quantity + item.quantity } : i)
               });
            } else {
               set({
                 items: [...items, {
                   id: Math.random().toString(36).substring(2, 9),
                   productId: item.productId,
                   variantId: item.variantId,
                   variantName: item.variantName ?? undefined,
                   quantity: item.quantity,
                   title: item.title || { vi: '', en: '' },
                   price: item.price || 0,
                   imageUrl: item.imageUrl
                 }]
               });
            }
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        const { isGuest, items } = get();
        const previousItems = items;
        set({ items: items.filter(item => item.id !== itemId) });
        
        if (!isGuest) {
          try {
            const result = await removeCartItemAction(itemId);
            if (result.error) {
               set({ items: previousItems, error: result.error });
            }
          } catch (error: unknown) {
             set({ items: previousItems, error: error instanceof Error ? error.message : 'An error occurred removing item' });
          }
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const { isGuest, items } = get();
        const previousItems = items;
        const finalQuantity = Math.max(1, quantity);
        set({
          items: items.map(item => item.id === itemId ? { ...item, quantity: finalQuantity } : item)
        });

        if (!isGuest) {
          try {
            const result = await updateCartItemAction(itemId, finalQuantity);
            if (result.error) {
              set({ items: previousItems, error: result.error });
            }
          } catch (error: unknown) {
            set({ items: previousItems, error: error instanceof Error ? error.message : 'An error occurred updating quantity' });
          }
        }
      },

      clearCart: async () => {
        set({ items: [] });
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage)
    }
  )
);
