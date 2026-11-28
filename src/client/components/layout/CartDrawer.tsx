"use client";

import { useCart } from "@/client/hooks/useCart";
import { useCartDrawerStore } from "@/client/hooks/useCartDrawerStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/constants";
import { usePathname } from "next/navigation";
import { useI18n } from "@/client/components/common/I18nContext";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/shared/utils";
import { getLocalizedText } from "@/shared/utils/locale";
import { toast } from "@/client/hooks/useToastStore";
import { ShoppingBag, X, ArrowUpRight, Image as ImageIcon, Loader2 } from "lucide-react";

/**
 * Slide-over cart panel on the Spec Sheet chrome.
 *
 * Business logic is unchanged: quantity updates, removal, route-aware closing
 * and the checkout pending state all keep their previous behaviour.
 *
 * @returns Cart drawer tree.
 */
export default function CartDrawer(): React.JSX.Element {
  const { dict, locale } = useI18n();
  const { items, subtotal, removeItem, updateQuantity, isLoading, error } = useCart();
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsNavigatingToCheckout(false);
    }
  }

  // Safety timeout: reset checkout loading state if navigation stalls or is aborted
  useEffect(() => {
    if (!isNavigatingToCheckout) return;
    const timer = setTimeout(() => {
      setIsNavigatingToCheckout(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isNavigatingToCheckout]);

  const prevPathname = useRef(pathname);

  // Close drawer when route changes (e.g. navigation to checkout completes)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (isOpen) {
        closeDrawer();
      }
    }
  }, [pathname, isOpen, closeDrawer]);

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        closeDrawer();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDrawer]);

  const handleRemove = (id: string, title?: string): void => {
    removeItem(id);
    toast.info(dict.cart.removedTitle, title ? `${title}` : undefined);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[991] cursor-pointer bg-dark/45"
          />

          {/* Sliding side drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-[991] flex h-full w-full max-w-[420px] flex-col border-l border-border bg-background font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center border border-border text-primary">
                  <ShoppingBag size={16} />
                </span>
                <h2 className="font-display text-[15px] font-bold tracking-[-0.03em] text-dark">
                  {dict.drawer.title}
                </h2>
                <span className="mono-meta border border-border px-1.5 py-1 text-[8px] text-dark/60">
                  {String(items.reduce((acc, curr) => acc + curr.quantity, 0)).padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center border border-border text-dark/45 transition-colors hover:border-dark hover:text-dark"
                type="button"
                aria-label={dict.drawer.closeDrawer}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {error && (
                <div className="mb-3 border border-error/30 bg-error/5 p-3 text-[11.5px] font-medium text-error">
                  {error}
                </div>
              )}
              {isLoading && items.length === 0 ? (
                <div className="space-y-3 py-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3">
                      <div className="h-18 w-18 border border-border bg-background-subtle" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-3/4 bg-background-subtle" />
                        <div className="h-2.5 w-1/2 bg-background-subtle" />
                        <div className="mt-4 h-2.5 w-1/4 bg-background-subtle" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center border border-border text-dark/25">
                    <ShoppingBag size={24} />
                  </span>
                  <p className="font-display text-[15px] font-bold tracking-[-0.03em] text-dark">
                    {dict.drawer.emptyTitle}
                  </p>
                  <p className="mt-1.5 max-w-[220px] text-[11.5px] leading-relaxed text-dark/45">
                    {dict.drawer.emptyDesc}
                  </p>
                  <button
                    onClick={closeDrawer}
                    type="button"
                    className="mt-6 bg-dark px-5 py-2.5 mono-meta text-[8.5px] text-background transition-colors hover:bg-primary"
                  >
                    {dict.drawer.exploreMenu}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const productTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.04 }}
                          className="group flex gap-3 border border-border bg-surface p-3 transition-colors hover:border-dark/30"
                        >
                          <div className="relative h-18 w-18 shrink-0 overflow-hidden border border-border bg-background-subtle">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={productTitle}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-dark/20">
                                <ImageIcon size={16} />
                              </span>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between py-0.5">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2 text-[11.5px] font-semibold leading-tight text-dark">
                                  {productTitle}
                                </h3>
                                <button
                                  onClick={() => handleRemove(item.id, productTitle)}
                                  className="p-0.5 text-dark/30 transition-colors hover:text-error"
                                  aria-label={dict.drawer.removeItem}
                                  type="button"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              {item.variantName && (
                                <p className="mono-meta mt-1 text-[7.5px] text-dark/35">
                                  {dict.drawer.portion} {item.variantName}
                                </p>
                              )}
                            </div>

                            <div className="mt-2 flex items-end justify-between">
                              <div className="flex items-center border border-border bg-background px-1.5 py-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="flex h-5 w-5 items-center justify-center text-[11px] text-dark/45 transition-colors hover:text-dark"
                                  aria-label={dict.drawer.decreaseQty}
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="w-5 select-none text-center font-mono text-[10px] font-semibold text-dark">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="flex h-5 w-5 items-center justify-center text-[11px] text-dark/45 transition-colors hover:text-dark"
                                  aria-label={dict.drawer.increaseQty}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-primary">
                                {formatCurrency(item.price * item.quantity, locale)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 && (
              <div className="space-y-3 border-t border-border bg-surface px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="mono-meta text-[8.5px] text-dark/40">{dict.drawer.subtotal}</span>
                  <span className="font-mono text-[15px] font-semibold text-primary">
                    {formatCurrency(subtotal, locale)}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-dark/40">{dict.drawer.deliveryNote}</p>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <Link
                    href={ROUTES.CHECKOUT}
                    onClick={(e) => {
                      // Do not trigger pending state if opened in a new tab/window via modifier keys or non-primary click
                      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
                        return;
                      }
                      setIsNavigatingToCheckout(true);
                    }}
                    className={`flex w-full items-center justify-center gap-2 bg-dark py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary ${
                      isNavigatingToCheckout ? "pointer-events-none cursor-not-allowed opacity-75" : ""
                    }`}
                  >
                    {isNavigatingToCheckout ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{dict.common.redirecting}</span>
                      </>
                    ) : (
                      <>
                        <span>{dict.drawer.checkoutCTA}</span>
                        <ArrowUpRight size={14} />
                      </>
                    )}
                  </Link>
                  <button
                    onClick={closeDrawer}
                    type="button"
                    className="w-full py-1.5 mono-meta text-[8px] text-dark/45 transition-colors hover:text-dark"
                  >
                    {dict.drawer.continueCTA}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
