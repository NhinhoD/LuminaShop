'use client';

import { useCartStore } from './useCartStore';

export function useCart() {
  const store = useCartStore();

  return {
    items: store.items,
    isLoading: store.isLoading,
    error: store.error,
    totalItems: store.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: store.items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    syncWithServer: store.syncWithServer,
  };
}
