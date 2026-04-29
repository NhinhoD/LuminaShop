"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/infrastructure/supabase/client';
import { 
  addToCartAction, 
  getCartAction, 
  mergeCartAction, 
  removeCartItemAction, 
  updateCartItemAction 
} from '@/presentation/actions/cart';

export interface CartItem {
  id: string; // This could be the DB ID or a local unique string
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  const fetchDBCart = useCallback(async () => {
    const result = await getCartAction();
    if (result.data) {
      const mappedItems = result.data.items.map(i => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        title: i.productTitle || "",
        price: i.productPrice || 0,
        imageUrl: i.productImageUrl,
        quantity: i.quantity
      }));
      setItems(mappedItems);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial user check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchDBCart();
      } else {
        const savedCart = localStorage.getItem('lumina_cart');
        if (savedCart) setItems(JSON.parse(savedCart));
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user;
      setUser(newUser);
      
      if (event === 'SIGNED_IN' && newUser) {
        // Merge local cart to DB
        const savedCart = localStorage.getItem('lumina_cart');
        if (savedCart) {
          const localItems = JSON.parse(savedCart);
          await mergeCartAction(localItems);
          localStorage.removeItem('lumina_cart');
        }
        await fetchDBCart();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
        localStorage.removeItem('lumina_cart');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchDBCart]);

  // Save local cart to localStorage on change if not logged in
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('lumina_cart', JSON.stringify(items));
    }
  }, [items, user, loading]);

  const addItem = async (newItem: Omit<CartItem, 'id'>) => {
    if (user) {
      const result = await addToCartAction(newItem);
      if (result.success) await fetchDBCart();
      else alert(result.error);
    } else {
      setItems((prev) => {
        const id = `${newItem.productId}-${newItem.variantId || 'base'}`;
        const existingItem = prev.find((item) => item.id === id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + newItem.quantity } : item
          );
        }
        return [...prev, { ...newItem, id }];
      });
    }
  };

  const removeItem = async (id: string) => {
    if (user) {
      await removeCartItemAction(id);
      await fetchDBCart();
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    if (user) {
      await updateCartItemAction(id, quantity);
      await fetchDBCart();
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    if (!user) localStorage.removeItem('lumina_cart');
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
