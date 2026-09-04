"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/presentation/hooks/useCart";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { getLocalizedText } from "@/presentation/utils/locale";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/presentation/hooks/useToastStore";
import { ShoppingBag, Image as ImageIcon, Minus, Plus, ArrowRight, ShieldCheck, Zap } from "lucide-react";

/**
 * Shopping cart page displaying selected products.
 * Allows quantity adjustment, item removal, and checkout navigation with order summary.
 */
export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { dict, locale } = useI18n();

  /**
   * Removes an item from the cart and shows a toast notification.
   */
  const handleRemove = (id: string, title?: string) => {
    removeItem(id);
    toast.info(
      locale === "vi" ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Item removed from cart",
      title ? `${title}` : undefined
    );
  };

  if (items.length === 0) {
    return (
      <main className="flex-grow py-20 px-6 sm:px-8 max-w-[1400px] mx-auto w-full flex flex-col items-center justify-center text-center font-sans">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
          <ShoppingBag size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">
          {dict?.cart?.emptyTitle || (locale === "vi" ? "Giỏ hàng đang trống" : "Your cart is empty")}
        </h1>
        <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
          {dict?.cart?.emptyDesc || (locale === "vi" ? "Có vẻ như bạn chưa thêm giao diện nào vào giỏ hàng. Hãy khám phá bộ sưu tập của chúng tôi để chọn mẫu ưng ý." : "Looks like you haven't added any templates to your cart yet. Explore our catalog to find your next digital asset.")}
        </p>
        <Link 
          href={ROUTES.SHOP} 
          className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <span>{dict?.cart?.startShopping || (locale === "vi" ? "Khám phá template" : "Explore Templates")}</span>
          <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow py-12 px-6 sm:px-8 max-w-[1400px] mx-auto w-full font-sans">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        
        {/* Cart Items Column */}
        <div className="flex-grow w-full lg:max-w-3xl">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
              {dict?.cart?.title || (locale === "vi" ? "Giỏ hàng của bạn" : "Shopping Cart")}
            </h1>
            <p className="text-slate-500 text-xs font-normal">
              {items.length} {dict?.cart?.itemCount || (locale === "vi" ? "sản phẩm đã chọn" : "selected items")}
            </p>
          </header>

          <div className="space-y-4">
            {items.map((item) => {
              const productTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale);
              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-primary/30 transition-all group">
                  <div className="w-full sm:w-28 sm:h-36 aspect-[16/10] sm:aspect-auto bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-100/80">
                    {item.imageUrl ? (
                      <Image 
                        alt={productTitle} 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={item.imageUrl} 
                        fill
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium mb-1.5">
                            <Zap size={12} />
                            <span>{locale === "vi" ? "Bản quyền số • Trọn đời" : "Digital License • Lifetime"}</span>
                          </div>
                          <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-primary transition-colors tracking-tight">
                            {productTitle}
                          </h3>
                          <p className="text-xs font-normal text-slate-400">
                            {dict?.cart?.selectionBadge || (locale === "vi" ? "Mã nguồn đầy đủ + Tài liệu kiến trúc Clean Arch" : "Full Source Code & Clean Arch Docs")}
                          </p>
                        </div>
                        <p className="font-bold text-primary text-base whitespace-nowrap font-mono">
                          {formatCurrency(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200/80 rounded-lg h-8 px-1 bg-slate-50/80">
                          <button 
                            onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            type="button"
                            className={`w-6 h-6 flex items-center justify-center text-slate-400 transition-colors ${
                              item.quantity <= 1 
                                ? "opacity-40 cursor-not-allowed" 
                                : "hover:text-slate-950 cursor-pointer"
                            }`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-slate-900 font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            type="button"
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleRemove(item.id, productTitle)}
                          type="button"
                          className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          {dict?.cart?.remove || (locale === "vi" ? "Xóa" : "Remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 md:p-8 sticky top-28 border border-slate-100 shadow-xs space-y-6">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              {dict?.cart?.orderSummary || (locale === "vi" ? "Tóm tắt đơn hàng" : "Order Summary")}
            </h2>
            
            <div className="space-y-3 pb-6 border-b border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">{dict?.cart?.subtotal || (locale === "vi" ? "Tạm tính" : "Subtotal")}</span>
                <span className="text-slate-900 font-semibold font-mono">{formatCurrency(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">{dict?.cart?.shipping || (locale === "vi" ? "Bàn giao số" : "Digital Delivery")}</span>
                <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                  <Zap size={12} />
                  {dict?.cart?.freeShipping || (locale === "vi" ? "Tự động tức thì (Miễn phí)" : "Instant Automated (Free)")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">{dict?.cart?.tax || (locale === "vi" ? "Thuế VAT (0%)" : "Estimated Tax (0%)")}</span>
                <span className="text-slate-900 font-semibold font-mono">{formatCurrency(0, locale)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-900 text-sm tracking-tight">{dict?.cart?.total || (locale === "vi" ? "Tổng thanh toán" : "Total")}</span>
              <span className="text-xl font-bold text-primary font-mono">{formatCurrency(subtotal, locale)}</span>
            </div>

            <Link 
              href={ROUTES.CHECKOUT}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>{dict?.cart?.secureCheckout || (locale === "vi" ? "Tiến hành thanh toán" : "Proceed to Checkout")}</span>
              <ArrowRight size={15} />
            </Link>

            <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-600 font-normal bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>{locale === "vi" ? "Bảo mật giao dịch tự động qua VietQR / PayOS" : "Secured automated payment via VietQR / PayOS"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
