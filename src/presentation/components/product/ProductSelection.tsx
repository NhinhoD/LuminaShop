"use client";

import React, { useState, useMemo } from "react";
import { Product, ProductVariant } from "@/domain/entities/Product";
import { formatCurrency } from "@/lib/utils";
import { Heart, Download, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useI18n } from "@/presentation/components/common/I18nContext";

interface ProductSelectionProps {
  product: Product;
  hasPurchased?: boolean;
}

export default function ProductSelection({ product, hasPurchased }: ProductSelectionProps): React.ReactElement | null {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const { addItem } = useCart();
  const { dict, locale } = useI18n();

  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentPrice = useMemo(() => {
    if (!selectedVariant) return product.price;
    return product.price + selectedVariant.priceAdjustment;
  }, [product.price, selectedVariant]);

  const currentStock = useMemo(() => {
    if (!selectedVariant) return product.stock;
    return selectedVariant.stockQuantity;
  }, [product.stock, selectedVariant]);

  const isInStock = currentStock > 0;
  const isFree = currentPrice === 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Price and Stock Status */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {isFree ? (dict?.common?.free?.toUpperCase() || (locale === "vi" ? "MIỄN PHÍ" : "FREE")) : formatCurrency(currentPrice, locale)}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${
              isInStock
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-700 bg-red-50"
            }`}
          >
            {isInStock 
              ? (dict?.product?.inStock || (locale === "vi" ? "Có sẵn" : "In Stock"))
              : (dict?.product?.outOfStock || (locale === "vi" ? "Tạm hết" : "Out of Stock"))}
          </span>
        </div>
        {selectedVariant && (
          <p className="text-xs text-slate-500 font-normal">
            {dict?.product?.selectedOption || (locale === "vi" ? "Đã chọn gói:" : "Selected license:")}{" "}
            <strong className="font-semibold text-slate-800">{selectedVariant.name}</strong>
          </p>
        )}
      </div>

      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
            {dict?.product?.chooseOption || (locale === "vi" ? "Lựa chọn gói bản quyền" : "Choose License Option")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  type="button"
                  className={`p-3 rounded-lg text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 text-primary border-primary font-semibold"
                      : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 font-medium"
                  }`}
                >
                  <div className="text-xs font-semibold">{variant.name}</div>
                  {variant.priceAdjustment !== 0 && (
                    <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-primary" : "text-slate-500"}`}>
                      {variant.priceAdjustment > 0 ? "+" : ""}
                      {formatCurrency(variant.priceAdjustment, locale)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Add to Cart Actions */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={async () => {
            if (isFree || hasPurchased) {
              if (product.sourceCodeUrl) {
                window.open(product.sourceCodeUrl, "_blank");
              }
              return;
            }

            setIsProcessing(true);
            setErrorMsg(null);
            try {
              await addItem({
                productId: product.id,
                variantId: selectedVariant?.id,
                variantName: selectedVariant?.name,
                quantity: 1,
                title: product.title as unknown as Record<string, string>,
                price: currentPrice,
                imageUrl: product.imageUrl
              });

              router.push("/checkout");
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : (locale === "vi" ? "Đã xảy ra lỗi hệ thống." : "A system error occurred."));
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
          className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isFree ? (
            <><Download size={16} /> {dict?.product?.freeDownload || (locale === "vi" ? "Tải xuống miễn phí" : "Free Download")}</>
          ) : hasPurchased ? (
            <><Download size={16} /> {dict?.product?.downloadZip || (locale === "vi" ? "Tải file source code (.zip)" : "Download Source Code (.zip)")}</>
          ) : (
            <><CreditCard size={16} /> {dict?.product?.payToPurchase || (locale === "vi" ? "Mua bản quyền ngay" : "Purchase License Now")}</>
          )}
        </button>

        <button 
          type="button"
          className="w-full py-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Heart size={15} />
          <span>{dict?.product?.addToWishlist || (locale === "vi" ? "Thêm vào danh sách yêu thích" : "Add to Wishlist")}</span>
        </button>
      </div>
    </div>
  );
}
