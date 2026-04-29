"use client";

import React from 'react';
import { useCart, CartItem } from '@/presentation/components/common/CartContext';

interface QuickAddButtonProps {
  product: CartItem;
}

export default function QuickAddButton({ product }: QuickAddButtonProps) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, quantity: 1 });
  };

  return (
    <button 
      onClick={handleAdd}
      className="absolute bottom-4 right-4 w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl hover:bg-black hover:text-white active:scale-90"
      aria-label="Add to Cart"
    >
      <span className="material-symbols-outlined text-[20px]">add</span>
    </button>
  );
}
