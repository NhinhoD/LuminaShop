"use client";

import React, { useState } from 'react';
import { useCart } from '@/presentation/hooks/useCart';
import { CartItem } from '@/presentation/hooks/useCartStore';
import { useI18n } from '@/presentation/components/common/I18nContext';
import { toast } from '@/presentation/hooks/useToastStore';
import { getLocalizedText } from '@/presentation/utils/locale';
import { Check, ShoppingBag } from 'lucide-react';

interface AddToCartButtonProps {
  product: CartItem;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { dict, locale } = useI18n();

  const handleAdd = () => {
    setIsAdding(true);
    
    setTimeout(() => {
      addItem({ ...product, title: product.title as unknown as Record<string, string> });
      setIsAdding(false);
      setIsSuccess(true);
      
      const title = getLocalizedText(product.title as unknown as Record<string, string>, locale);
      toast.success(
        locale === "vi" ? "Đã thêm vào giỏ hàng!" : "Added to Cart!",
        title ? `${title}` : undefined
      );

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 300);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={isAdding}
      type="button"
      className={`w-full py-5 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
        isSuccess 
          ? "bg-green-600 text-white" 
          : "bg-slate-950 text-white hover:bg-[#0051d5]"
      } ${isAdding ? "opacity-80" : ""} active:scale-98`}
    >
      {isAdding ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : isSuccess ? (
        <>
          <Check size={18} />
          <span>{locale === "vi" ? "Đã thêm vào giỏ" : "Added to Cart"}</span>
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          <span>{dict?.shop?.addToCart || (locale === "vi" ? "Thêm vào giỏ" : "Add to Cart")}</span>
        </>
      )}
    </button>
  );
}
