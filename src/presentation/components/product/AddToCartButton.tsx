"use client";

import React, { useState } from 'react';
import { useCart, CartItem } from '@/presentation/components/common/CartContext';

interface AddToCartButtonProps {
  product: CartItem;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    
    // Simulate a bit of loading for UX feel
    setTimeout(() => {
      addItem(product);
      setIsAdding(false);
      setIsSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 400);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={isAdding}
      className={`w-full py-5 rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
        isSuccess 
          ? "bg-green-600 text-white" 
          : "bg-slate-950 text-white hover:bg-[#0051d5]"
      } ${isAdding ? "opacity-80" : ""}`}
    >
      {isAdding ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : isSuccess ? (
        <>
          <span className="material-symbols-outlined text-[18px]">check</span>
          Added to Bag
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          Add to Bag
        </>
      )}
    </button>
  );
}
