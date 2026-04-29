'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  addToCartAction, 
  updateCartItemAction, 
  removeCartItemAction, 
  getCartAction,
  mergeCartAction
} from '@/presentation/actions/cart';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  productTitle?: string;
  productPrice?: number;
  productImageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  syncWithServer: () => Promise<void>;
  addItem: (item: { productId: string, variantId?: string, quantity: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
} | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM':
      // Optimistic or just wait for server? The requirement says SYNC_WITH_SERVER.
      // Usually we refetch after server action.
      return state;
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const syncWithServer = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await getCartAction();
      if (result.data) {
        dispatch({ type: 'SET_ITEMS', payload: result.data.items });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    syncWithServer();
  }, []);

  const addItem = async (item: { productId: string, variantId?: string, quantity: number }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await addToCartAction(item);
      if (result.error) {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      } else {
        await syncWithServer();
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update
    const previousItems = state.items;
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    
    try {
      const result = await removeCartItemAction(itemId);
      if (result.error) {
        dispatch({ type: 'SET_ITEMS', payload: previousItems });
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ITEMS', payload: previousItems });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const previousItems = state.items;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    
    try {
      const result = await updateCartItemAction(itemId, quantity);
      if (result.error) {
        dispatch({ type: 'SET_ITEMS', payload: previousItems });
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ITEMS', payload: previousItems });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const clearCart = async () => {
    // Implement clear cart server action if needed, or just remove all items
    // For now just clearing locally as per typical MVP if action not provided
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider 
      value={{ 
        state, 
        dispatch, 
        syncWithServer, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
