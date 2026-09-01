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

  const chooseOptionText = dict?.shop?.chooseOption || "Choose Option";
  const addToCartText = dict?.shop?.addToCart || "Add to Cart";

  return (
    <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group/tooltip">
      {hasVariants && (
        <div className="absolute bottom-12 right-0 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-bold py-2 px-3.5 rounded-lg shadow-xl uppercase tracking-widest opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-300 translate-y-1 group-hover/tooltip:translate-y-0 whitespace-nowrap border border-white/10">
          {chooseOptionText}
          <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
        </div>
      )}
      <button 
        onClick={handleAdd}
        className="w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-xl hover:bg-black hover:text-white active:scale-90 transition-all cursor-pointer"
        aria-label={hasVariants ? chooseOptionText : addToCartText}
        title={hasVariants ? chooseOptionText : addToCartText}
        type="button"
      >
        {hasVariants ? (
          <ArrowRight size={18} />
        ) : (
          <Plus size={18} />
        )}
      </button>
    </div>
  );
}
