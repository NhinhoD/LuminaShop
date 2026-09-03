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

      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 200);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={isAdding}
      type="button"
      className={`w-full py-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
        isSuccess 
          ? "bg-emerald-600 text-white" 
          : "bg-primary text-white hover:bg-primary-dark"
      } ${isAdding ? "opacity-75" : ""} active:scale-98`}
    >
      {isAdding ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : isSuccess ? (
        <>
          <Check size={14} />
          <span>{locale === "vi" ? "Đã thêm vào giỏ" : "Added to Cart"}</span>
        </>
      ) : (
        <>
          <ShoppingBag size={14} />
          <span>{dict?.shop?.addToCart || (locale === "vi" ? "Thêm vào giỏ" : "Add to Cart")}</span>
        </>
      )}
    </button>
  );
}
