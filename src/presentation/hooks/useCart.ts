'use client';

import { useCartContext } from '@/presentation/providers/CartProvider';

export function useCart() {
  const { 
    state, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    syncWithServer 
  } = useCartContext();

  return {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    totalItems: state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: state.items.reduce((total, item) => total + (item.productPrice || 0) * item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncWithServer,
  };
}
