import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (newToast) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const duration = newToast.duration ?? 4000;

    set((state) => ({
      toasts: [...state.toasts, { ...newToast, id, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
}));

/**
 * Universal toast trigger functions accessible from anywhere in client code
 */
export const toast = {
  success: (title: string, description?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'success', title, description, duration });
  },
  error: (title: string, description?: string, duration = 5000) => {
    return useToastStore.getState().addToast({ type: 'error', title, description, duration });
  },
  warning: (title: string, description?: string, duration = 4500) => {
    return useToastStore.getState().addToast({ type: 'warning', title, description, duration });
  },
  info: (title: string, description?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'info', title, description, duration });
  },
};
