"use client";

import React, { useState, useMemo } from 'react';
import { Product, ProductVariant } from '@/domain/entities/Product';
import { formatCurrency } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';

interface ProductSelectionProps {
  product: Product;
}

export default function ProductSelection({ product }: ProductSelectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const currentPrice = useMemo(() => {
    if (!selectedVariant) return product.price;
    return product.price + selectedVariant.priceAdjustment;
  }, [product.price, selectedVariant]);

  const currentStock = useMemo(() => {
    if (!selectedVariant) return product.stock;
    return selectedVariant.stockQuantity;
  }, [product.stock, selectedVariant]);

  const isInStock = currentStock > 0;

  return (
    <div className="space-y-10">
      {/* Price and Stock Status */}
      <div>
        <div className="flex items-center gap-6 mb-2">
          <span className="text-3xl font-bold text-slate-950">
            {formatCurrency(currentPrice)}
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
            isInStock ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          }`}>
            {isInStock ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>
        {selectedVariant && (
          <p className="text-xs text-slate-500">
            Đang chọn: <strong>{selectedVariant.name}</strong> (SKU: {selectedVariant.sku})
          </p>
        )}
      </div>

      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-6">
              <span className="text-[11px] font-bold text-slate-950 uppercase tracking-widest">
                Chọn phiên bản
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`py-4 px-3 rounded-lg font-bold text-xs transition-all border ${
                    selectedVariant?.id === variant.id
                      ? "bg-slate-950 text-white border-slate-950 shadow-lg"
                      : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{variant.name}</span>
                    {variant.priceAdjustment !== 0 && (
                      <span className={`text-[9px] ${selectedVariant?.id === variant.id ? "text-slate-300" : "text-slate-400"}`}>
                        {variant.priceAdjustment > 0 ? "+" : ""}{formatCurrency(variant.priceAdjustment)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Actions */}
      <div className="space-y-4 pt-4">
        <AddToCartButton 
          product={{
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            title: selectedVariant ? `${product.title} - ${selectedVariant.name}` : product.title,
            price: currentPrice,
            imageUrl: product.imageUrl || undefined,
            quantity: 1
          }} 
        />
        <button className="w-full py-5 rounded-lg border border-slate-950 text-slate-950 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
          Thêm vào danh sách ước
        </button>
      </div>
    </div>
  );
}
