"use client";

import React from 'react';
import { useCart } from '@/presentation/hooks/useCart';
import { CartItem } from '@/presentation/hooks/useCartStore';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/presentation/constants';
import { useI18n } from '@/presentation/components/common/I18nContext';
import { toast } from '@/presentation/hooks/useToastStore';
import { getLocalizedText } from '@/presentation/utils/locale';
import { Plus, ArrowRight } from 'lucide-react';

interface QuickAddButtonProps {
  product: CartItem;
  hasVariants?: boolean;
}

export default function QuickAddButton({ product, hasVariants = false }: QuickAddButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const { dict, locale } = useI18n();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      router.push(`${ROUTES.PRODUCT}/${product.productId}`);
    } else {
      addItem({ ...product, quantity: 1 });
      const title = getLocalizedText(product.title as unknown as Record<string, string>, locale);
      toast.success(
        locale === "vi" ? "Đã thêm vào giỏ hàng!" : "Added to Cart!",
        title ? `${title}` : undefined
      );
    }
  };

  const chooseOptionText = dict?.shop?.chooseOption || (locale === "vi" ? "Chọn gói" : "Choose Option");
  const addToCartText = dict?.shop?.addToCart || (locale === "vi" ? "Thêm vào giỏ" : "Add to Cart");

  return (
    <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
      <button 
        onClick={handleAdd}
        className="w-8 h-8 bg-white text-slate-900 rounded-lg flex items-center justify-center shadow-md hover:bg-primary hover:text-white active:scale-95 transition-colors cursor-pointer border border-slate-100"
        aria-label={hasVariants ? chooseOptionText : addToCartText}
        title={hasVariants ? chooseOptionText : addToCartText}
        type="button"
      >
        {hasVariants ? (
          <ArrowRight size={14} />
        ) : (
          <Plus size={14} />
        )}
      </button>
    </div>
  );
}
