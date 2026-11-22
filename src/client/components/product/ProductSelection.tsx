"use client";

import React, { useState, useMemo } from "react";
import { Product, ProductVariant } from "@/shared/types/product";
import { formatCurrency } from "@/shared/utils";
import { Heart, Download, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/client/hooks/useCart";
import { useI18n } from "@/client/components/common/I18nContext";

interface ProductSelectionProps {
  product: Product;
  hasPurchased?: boolean;
  purchaseLookupError?: boolean;
}

/**
 * License selection, price and purchase actions for a product.
 *
 * @param props - Product, purchase state and lookup error flag.
 * @returns Purchase panel.
 */
export default function ProductSelection({ product, hasPurchased, purchaseLookupError }: ProductSelectionProps): React.ReactElement | null {
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
    <div className="space-y-5 font-sans">
      {/* Price and stock status */}
      <div className="border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="mono-meta block text-[8px] text-dark/35">{dict.shop.priceLabel}</span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-mono text-[1.65rem] font-semibold leading-none text-dark">
                {isFree ? dict.common.free : formatCurrency(currentPrice, locale)}
              </span>
              {!isFree ? (
                <span className="mono-meta text-[8px] text-dark/35">{dict.shop.perLifetime}</span>
              ) : null}
            </div>
          </div>
          <span
            className={`mono-meta flex items-center gap-1.5 border px-1.5 py-1 text-[8px] ${
              isInStock ? "border-success/40 text-success" : "border-error/40 text-error"
            }`}
          >
            <span className={`h-1.5 w-1.5 ${isInStock ? "bg-success" : "bg-error"}`} />
            {isInStock ? dict.product.inStock : dict.product.outOfStock}
          </span>
        </div>

        {selectedVariant && (
          <p className="mono-meta mt-3 border-t border-border pt-3 text-[8px] text-dark/40">
            {dict.product.selectedOption}{" "}
            <strong className="font-semibold text-dark">{selectedVariant.name}</strong>
          </p>
        )}
      </div>

      {/* Variant selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="mono-meta block text-[8.5px] text-dark/45">
            {dict.product.chooseOption}
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  type="button"
                  className={`border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-dark bg-dark text-background"
                      : "border-border bg-surface text-dark/70 hover:border-dark hover:text-dark"
                  }`}
                >
                  <div className="text-[11.5px] font-semibold leading-tight">{variant.name}</div>
                  {variant.priceAdjustment !== 0 && (
                    <div
                      className={`mt-1 font-mono text-[10px] ${
                        isSelected ? "text-primary" : "text-dark/45"
                      }`}
                    >
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

      {/* Error notices */}
      {errorMsg && (
        <div className="border border-error/30 bg-error/5 p-3 text-[11.5px] font-medium text-error">
          {errorMsg}
        </div>
      )}

      {purchaseLookupError && (
        <div className="border border-primary/40 bg-primary/5 p-3 mono-meta text-[8.5px] leading-relaxed text-primary">
          {dict.product.lookupError}
        </div>
      )}

      {/* Purchase actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={async () => {
            if (purchaseLookupError) {
              window.location.reload();
              return;
            }

            if (isFree || hasPurchased) {
              if (product.sourceCodeUrl) {
                window.open(product.sourceCodeUrl, "_blank", "noopener,noreferrer");
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
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 bg-dark py-3.5 text-[12px] font-semibold text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isProcessing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : purchaseLookupError ? (
            <>{dict.product.reloadToVerify}</>
          ) : isFree ? (
            <><Download size={15} /> {dict.product.freeDownload}</>
          ) : hasPurchased ? (
            <><Download size={15} /> {dict.product.downloadZip}</>
          ) : (
            <><CreditCard size={15} /> {dict.product.payToPurchase}</>
          )}
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 border border-border py-3 text-[11.5px] font-medium text-dark/60 transition-colors hover:border-dark hover:text-dark"
        >
          <Heart size={14} />
          <span>{dict.product.addToWishlist}</span>
        </button>
      </div>
    </div>
  );
}
