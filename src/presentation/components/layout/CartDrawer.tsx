"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { useCartDrawerStore } from "@/presentation/hooks/useCartDrawerStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/presentation/constants";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { getLocalizedText } from "@/presentation/utils/locale";
import { toast } from "@/presentation/hooks/useToastStore";
import { ShoppingBag, X, ArrowRight, Image as ImageIcon } from "lucide-react";

export default function CartDrawer() {
  const { dict, locale } = useI18n();
  const { items, subtotal, removeItem, updateQuantity, isLoading, error } = useCart();
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleRemove = (id: string, title?: string) => {
    removeItem(id);
    toast.info(
      locale === "vi" ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Item removed from cart",
      title ? `${title}` : undefined
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Glassmorphism Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Side-Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#F8FAFC] z-50 shadow-2xl flex flex-col h-full border-none font-manrope"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-white soft-elevation">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#0051d5]" />
                <h2 className="text-lg font-playfair font-bold text-slate-900 tracking-wide">
                  {dict?.drawer?.title || (locale === "vi" ? "Giỏ hàng của bạn" : "Your Cart")}
                </h2>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full font-manrope">
                  {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={closeDrawer}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 text-sm font-medium border border-red-100 rounded-md mb-4">
                  {error}
                </div>
              )}
              {isLoading && items.length === 0 ? (
                <div className="space-y-4 py-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 w-3/4 rounded" />
                        <div className="h-3 bg-slate-200 w-1/2 rounded" />
                        <div className="h-3 bg-slate-200 w-1/4 mt-4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0051d5] flex items-center justify-center mb-4 shadow-inner">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-slate-800 font-bold text-sm mb-2 uppercase tracking-widest font-manrope">
                    {dict?.drawer?.emptyTitle || (locale === "vi" ? "Giỏ hàng đang trống" : "Your cart is empty")}
                  </p>
                  <p className="text-slate-400 text-xs mb-8 font-manrope max-w-[240px]">
                    {dict?.drawer?.emptyDesc || (locale === "vi" ? "Hãy chọn các mẫu website cao cấp để bắt đầu" : "Select premium website templates to get started")}
                  </p>
                  <button 
                    onClick={closeDrawer}
                    type="button"
                    className="bg-[#0051d5] text-white font-button text-xs uppercase tracking-widest px-8 py-4 hover:bg-[#0041ab] transition-colors font-bold rounded-xl shadow-md shadow-blue-900/10 cursor-pointer"
                  >
                    {dict?.drawer?.exploreMenu || (locale === "vi" ? "Khám phá Template" : "Explore Templates")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const productTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale);
                      return (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-4 p-4 bg-white soft-elevation transition-all group rounded-2xl border border-slate-100"
                        >
                          <div className="w-20 h-24 bg-slate-50 overflow-hidden relative flex-shrink-0 rounded-xl">
                            {item.imageUrl ? (
                              <Image 
                                src={item.imageUrl} 
                                alt={productTitle} 
                                fill
                                sizes="80px"
                                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-playfair font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                                  {productTitle}
                                </h3>
                                <button 
                                  onClick={() => handleRemove(item.id, productTitle)}
                                  className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                  aria-label="Remove item"
                                  type="button"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              {item.variantName && (
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-manrope">
                                  {dict?.drawer?.portion || (locale === "vi" ? "Gói:" : "License:")} {item.variantName}
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-end mt-4">
                              <div className="flex items-center bg-[#F1F5F9] px-2 py-1 rounded-lg">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors focus:outline-none text-xs cursor-pointer"
                                  aria-label="Decrease quantity"
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="text-slate-800 text-xs font-bold w-6 text-center select-none font-manrope">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors focus:outline-none text-xs cursor-pointer"
                                  aria-label="Increase quantity"
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-slate-900 text-xs font-manrope">
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

            {/* Footer Summary (Checkout CTA) */}
            {items.length > 0 && (
              <div className="border-none px-8 py-6 bg-white soft-elevation space-y-5">
                <div className="flex justify-between items-center text-slate-900 font-bold">
                  <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    {dict?.drawer?.subtotal || (locale === "vi" ? "Tạm tính" : "Subtotal")}
                  </span>
                  <span className="text-base font-manrope font-extrabold text-[#0051d5]">
                    {formatCurrency(subtotal, locale)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-manrope leading-relaxed">
                  {dict?.drawer?.deliveryNote || (locale === "vi" ? "Mã nguồn và giấy phép được cấp quyền tải về tự động ngay sau khi thanh toán." : "Source code archive and license keys will be instantly available for download upon payment completion.")}
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link 
                    href={ROUTES.CHECKOUT}
                    onClick={closeDrawer}
                    className="w-full bg-[#0051d5] text-white font-button text-xs py-4 hover:bg-[#0041ab] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest font-bold rounded-xl shadow-lg shadow-blue-900/10"
                  >
                    <span>{dict?.drawer?.checkoutCTA || (locale === "vi" ? "Tiến hành thanh toán" : "Proceed to Checkout")}</span>
                    <ArrowRight size={14} />
                  </Link>
                  <button 
                    onClick={closeDrawer}
                    type="button"
                    className="w-full bg-transparent border-none text-slate-500 hover:text-slate-900 font-button text-[10px] uppercase tracking-widest py-2.5 transition-all cursor-pointer font-bold"
                  >
                    {dict?.drawer?.continueCTA || (locale === "vi" ? "Tiếp tục xem giao diện" : "Continue Browsing")}
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
