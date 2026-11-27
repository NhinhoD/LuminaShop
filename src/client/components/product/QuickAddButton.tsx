"use client";

import React, { useState } from 'react';
import { useCart } from '@/client/hooks/useCart';
import { CartItem } from '@/client/hooks/useCartStore';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants';
import { useI18n } from '@/client/components/common/I18nContext';
import { toast } from '@/client/hooks/useToastStore';
import { getLocalizedText } from '@/shared/utils/locale';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';

interface QuickAddButtonProps {
  product: CartItem;
  hasVariants?: boolean;
}

/**
 * Square quick-add control revealed on specimen hover.
 *
 * @param props - Cart item payload and whether the product has variants.
 * @returns Floating add-to-cart button.
 */
export default function QuickAddButton({ product, hasVariants = false }: QuickAddButtonProps): React.JSX.Element {
  const { addItem } = useCart();
  const router = useRouter();
  const { dict, locale } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    if (hasVariants) {
      router.push(`${ROUTES.PRODUCT}/${product.productId}`);
    } else {
      addItem({ ...product, quantity: 1 });
      const title = getLocalizedText(product.title as unknown as Record<string, string>, locale);
      toast.success(dict.cart.addedTitle, title ? `${title}` : undefined);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const chooseOptionText = dict.shop.chooseOption;
  const addToCartText = dict.shop.addToCart;

  return (
    <div className="absolute bottom-2.5 right-2.5 z-10 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className="flex h-8 w-8 items-center justify-center border border-dark bg-dark text-background transition-colors hover:border-primary hover:bg-primary disabled:cursor-not-allowed disabled:opacity-75"
        aria-label={hasVariants ? chooseOptionText : addToCartText}
        title={hasVariants ? chooseOptionText : addToCartText}
        type="button"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : hasVariants ? (
          <ArrowRight size={14} />
        ) : (
          <Plus size={14} />
        )}
      </button>
    </div>
  );
}
