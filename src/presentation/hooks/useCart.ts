'use client';

import { useCartStore } from './useCartStore';
import { useCartDrawerStore } from './useCartDrawerStore';

export function useCart() {
  const store = useCartStore();
  const { openDrawer } = useCartDrawerStore();

  const handleAddItem = async (item: Parameters<typeof store.addItem>[0]) => {
    await store.addItem(item);
    openDrawer();
  };

  return {
    items: store.items,
    isLoading: store.isLoading,
    error: store.error,
    totalItems: store.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: store.items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
    addItem: handleAddItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    syncWithServer: store.syncWithServer,
  };
}
