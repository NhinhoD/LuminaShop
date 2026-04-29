'use client';

import { useState, useCallback } from 'react';
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction 
} from '@/presentation/actions/product';

export function useProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createProductAction(data);
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateProductAction(id, data);
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await deleteProductAction(id);
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
