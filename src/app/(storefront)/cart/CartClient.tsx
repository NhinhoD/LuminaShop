"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/client/hooks/useCart";
import { useI18n } from "@/client/components/common/I18nContext";
import { getLocalizedText } from "@/shared/utils/locale";
import { ROUTES } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { toast } from "@/client/hooks/useToastStore";
import { ShoppingBag, Image as ImageIcon, Minus, Plus, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

/**
 * Shopping cart page displaying selected products.
 * Allows quantity adjustment, item removal, and checkout navigation with order summary.
 *
 * Presented as a two-column Spec Sheet invoice: numbered line items and a
 * sticky summary panel. Cart behaviour is unchanged.
 *
 * @returns Cart page tree.
 */
export default function CartClient(): React.JSX.Element {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { dict, locale } = useI18n();

  /**
   * Removes an item from the cart and shows a toast notification.
   *
   * @param id - Cart item id.
   * @param title - Optional display title for the toast body.
   */
  const handleRemove = (id: string, title?: string): void => {
    removeItem(id);
    toast.info(dict.cart.removedTitle, title ? `${title}` : undefined);
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col items-start justify-center px-5 py-20 font-sans sm:px-8">
        <span className="mono-meta text-primary">00 / {dict.cart.title}</span>
        <span className="mt-6 flex h-16 w-16 items-center justify-center border border-border text-dark/25">
          <ShoppingBag size={28} />
        </span>
        <h1 className="mt-6 display text-[clamp(1.7rem,3.4vw,2.8rem)] text-dark">
          {dict.cart.emptyTitle}
        </h1>
        <p className="mt-4 max-w-md text-[13px] leading-relaxed text-dark/55">
          {dict.cart.emptyDesc}
        </p>
        <Link
          href={ROUTES.SHOP}
          className="mt-8 inline-flex items-center gap-2 bg-dark px-6 py-3.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
        >
          <span>{dict.cart.startShopping}</span>
          <ArrowUpRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-grow px-5 py-10 font-sans sm:px-8 sm:py-14">
      <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-12">
        {/* Cart items column */}
        <div className="w-full flex-grow lg:max-w-3xl">
          <header className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="mono-meta text-primary">01 / {dict.cart.title}</span>
              <h1 className="mt-3 display text-[clamp(1.6rem,3vw,2.4rem)] text-dark">
                {dict.cart.title}
              </h1>
            </div>
            <p className="mono-meta shrink-0 text-[8.5px] text-dark/40">
              {String(items.length).padStart(2, "0")} {dict.cart.itemCount}
            </p>
          </header>

          <div className="space-y-px bg-border">
            {items.map((item, index) => {
              const productTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale);
              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 bg-surface p-4 transition-colors hover:bg-background sm:flex-row sm:p-5"
                >
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border border-border bg-background-subtle sm:aspect-auto sm:h-32 sm:w-24">
                    {item.imageUrl ? (
                      <Image
                        alt={productTitle}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        src={item.imageUrl}
                        fill
                        sizes="112px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-dark/20">
                        <ImageIcon size={22} />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-grow flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="mono-meta text-[8px] text-dark/30">
                            {dict.homeUi.labelSpec} {String(index + 1).padStart(3, "0")}
                          </span>
                          <h3 className="mt-1.5 truncate font-display text-[1rem] font-semibold tracking-[-0.03em] text-dark transition-colors group-hover:text-primary">
                            {productTitle}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-dark/45">
                            <Zap size={10} className="text-primary" />
                            <span>{dict.cart.digitalLicense}</span>
                          </p>
                          <p className="mt-1 text-[11px] text-dark/35">{dict.cart.sourceDocs}</p>
                        </div>
                        <p className="shrink-0 font-mono text-[13px] font-semibold text-primary">
                          {formatCurrency(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
                      <div className="flex h-8 items-center border border-border bg-background px-1">
                        <button
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          type="button"
                          aria-label={dict.drawer.decreaseQty}
                          className={`flex h-6 w-6 items-center justify-center transition-colors ${
                            item.quantity <= 1
                              ? "cursor-not-allowed text-dark/20"
                              : "cursor-pointer text-dark/45 hover:text-dark"
                          }`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 select-none text-center font-mono text-[10.5px] font-semibold text-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          type="button"
                          aria-label={dict.drawer.increaseQty}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center text-dark/45 transition-colors hover:text-dark"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, productTitle)}
                        type="button"
                        className="mono-meta text-[8px] text-dark/40 transition-colors hover:text-error"
                      >
                        {dict.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary column */}
        <div className="w-full flex-shrink-0 lg:w-[360px]">
          <div className="sticky top-24 space-y-5 border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="mono-meta text-[9px] text-dark/55">{dict.cart.orderSummary}</h2>
              <span className="mono-meta text-[8px] text-dark/25">
                {dict.homeUi.labelVerified}
              </span>
            </div>

            <div className="space-y-2.5 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-dark/50">{dict.cart.subtotal}</span>
                <span className="font-mono font-semibold text-dark">{formatCurrency(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-dark/50">{dict.cart.shipping}</span>
                <span className="flex items-center gap-1 text-success">
                  <Zap size={10} />
                  {dict.cart.freeShipping}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark/50">{dict.cart.tax}</span>
                <span className="font-mono font-semibold text-dark">{formatCurrency(0, locale)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-y border-border py-3.5">
              <span className="text-[12.5px] font-semibold text-dark">{dict.cart.total}</span>
              <span className="font-mono text-[1.05rem] font-semibold text-primary">
                {formatCurrency(subtotal, locale)}
              </span>
            </div>

            <Link
              href={ROUTES.CHECKOUT}
              className="flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark"
            >
              <span>{dict.cart.secureCheckout}</span>
              <ArrowUpRight size={14} />
            </Link>

            <div className="flex items-start gap-2 border border-border bg-background px-3 py-2.5 text-[10.5px] leading-relaxed text-dark/45">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-success" />
              <span>{dict.cart.securedPayment}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
