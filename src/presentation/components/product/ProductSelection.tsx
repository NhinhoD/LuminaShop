"use client";

import React, { useState, useMemo } from "react";
import { Product, ProductVariant } from "@/domain/entities/Product";
import { formatCurrency } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import { Heart } from "lucide-react";

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
    <div className="space-y-8">
      {/* Price and Stock Status */}
      <div>
        <div className="flex items-center gap-5 mb-2">
          <span className="text-3xl font-black text-primary font-playfair">
            {formatCurrency(currentPrice)}
          </span>
          <span
            className={`text-[0.7rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              isInStock
                ? "text-green bg-[rgba(45,106,79,0.1)]"
                : "text-[#e8281a] bg-[rgba(232,40,26,0.1)]"
            }`}
          >
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        {selectedVariant && (
          <p className="text-xs text-[#999]">
            Selected: <strong className="text-dark">{selectedVariant.name}</strong> (SKU: {selectedVariant.sku})
          </p>
        )}
      </div>

      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-4">
              <span className="text-sm font-bold text-dark uppercase tracking-wider font-poppins">
                Choose Option
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`py-4 px-3 rounded-xl font-bold text-xs transition-all border-2 cursor-pointer font-poppins ${
                    selectedVariant?.id === variant.id
                      ? "bg-primary text-white border-primary shadow-[0_4px_15px_rgba(232,40,26,0.3)]"
                      : "bg-white text-[#666] border-[#e5e5e5] hover:border-primary hover:text-primary"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{variant.name}</span>
                    {variant.priceAdjustment !== 0 && (
                      <span
                        className={`text-[9px] ${
                          selectedVariant?.id === variant.id ? "text-[rgba(255,255,255,0.7)]" : "text-[#aaa]"
                        }`}
                      >
                        {variant.priceAdjustment > 0 ? "+" : ""}
                        {formatCurrency(variant.priceAdjustment)}
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
      <div className="space-y-3 pt-2">
        <AddToCartButton
          product={{
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name ?? undefined,
            title: selectedVariant ? `${product.title} - ${selectedVariant.name}` : product.title,
            price: currentPrice,
            imageUrl: product.imageUrl || undefined,
            quantity: 1,
          }}
        />
        <button className="w-full py-4 rounded-full border-2 border-dark text-dark font-bold text-sm uppercase tracking-wider hover:bg-dark hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 font-poppins">
          <Heart size={16} />
          Add to Wishlist
        </button>
      </div>
    </div>
  );
}
