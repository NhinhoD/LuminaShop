"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/presentation/hooks/useCart";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { getLocalizedText } from "@/presentation/utils/locale";
import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/presentation/hooks/useToastStore";
import { ShoppingBag, Image as ImageIcon, Minus, Plus, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { dict, locale } = useI18n();

  const handleRemove = (id: string, title?: string) => {
    removeItem(id);
    toast.info(
      locale === "vi" ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Item removed from cart",
      title ? `${title}` : undefined
    );
  };

  if (items.length === 0) {
    return (
      <main className="flex-grow pt-32 pb-24 px-8 max-w-[1440px] mx-auto w-full flex flex-col items-center justify-center text-center font-manrope">
        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 text-[#0051d5] shadow-inner">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-950 mb-4 font-playfair">
          {dict?.cart?.emptyTitle || (locale === "vi" ? "Giỏ hàng đang trống" : "Your cart is empty")}
        </h1>
        <p className="text-slate-500 mb-10 max-w-md text-sm leading-relaxed">
          {dict?.cart?.emptyDesc || (locale === "vi" ? "Có vẻ như bạn chưa thêm giao diện nào vào giỏ hàng. Hãy khám phá bộ sưu tập của chúng tôi để chọn mẫu ưng ý." : "Looks like you haven't added any templates to your cart yet. Explore our catalog to find your next digital asset.")}
        </p>
        <Link 
          href={ROUTES.SHOP} 
          className="bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold text-xs px-10 py-4 rounded-xl uppercase tracking-widest transition-all shadow-md shadow-blue-900/10 active:scale-95 flex items-center gap-2"
        >
          <span>{dict?.cart?.startShopping || (locale === "vi" ? "Khám phá cửa hàng" : "Start Shopping")}</span>
          <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow pt-32 pb-24 px-8 max-w-[1440px] mx-auto w-full font-manrope">
      <div className="flex flex-col lg:flex-row gap-20">
        
        {/* Cart Items */}
        <div className="flex-grow lg:max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-950 mb-2 font-playfair">
              {dict?.cart?.title || (locale === "vi" ? "Giỏ hàng của bạn" : "Shopping Cart")}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {items.length} {dict?.cart?.itemCount || (locale === "vi" ? "sản phẩm" : "items")}
            </p>
          </header>

          <div className="space-y-8">
            {items.map((item) => {
              const productTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale);
              return (
                <div key={item.id} className="flex gap-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group">
                  <div className="w-32 h-40 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    {item.imageUrl ? (
                      <Image 
                        alt={productTitle} 
                        className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                        src={item.imageUrl} 
                        fill
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow py-1 justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-950 text-lg mb-1 font-playfair">
                          {productTitle}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {dict?.cart?.selectionBadge || (locale === "vi" ? "Giao diện chọn lọc" : "Selected Item")}
                        </p>
                      </div>
                      <p className="font-black text-slate-950 text-base">
                        {formatCurrency(item.price * item.quantity, locale)}
                      </p>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-slate-200 rounded-full h-9 px-1 bg-slate-50">
                          <button 
                            onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            type="button"
                            className={`w-7 h-7 flex items-center justify-center text-slate-400 transition-colors ${
                              item.quantity <= 1 
                                ? "opacity-50 cursor-not-allowed" 
                                : "hover:text-slate-950 cursor-pointer"
                            }`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-950">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            type="button"
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleRemove(item.id, productTitle)}
                          type="button"
                          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
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

        {/* Summary */}
        <div className="lg:w-[400px] flex-shrink-0">
          <div className="bg-slate-50 rounded-3xl p-8 md:p-10 sticky top-32 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-8 font-playfair">
              {dict?.cart?.orderSummary || (locale === "vi" ? "Tóm tắt đơn hàng" : "Order Summary")}
            </h2>
            
            <div className="space-y-5 mb-8 pb-8 border-b border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">{dict?.cart?.subtotal || (locale === "vi" ? "Tạm tính" : "Subtotal")}</span>
                <span className="text-slate-950 font-bold">{formatCurrency(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">{dict?.cart?.shipping || (locale === "vi" ? "Bàn giao số" : "Digital Delivery")}</span>
                <span className="text-emerald-600 font-extrabold uppercase text-[10px] tracking-wider">
                  {dict?.cart?.freeShipping || (locale === "vi" ? "Miễn phí (Tự động)" : "Free (Automated)")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">{dict?.cart?.tax || (locale === "vi" ? "Thuế VAT (0%)" : "Estimated Tax (0%)")}</span>
                <span className="text-slate-950 font-bold">{formatCurrency(0, locale)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-slate-950 text-sm">{dict?.cart?.total || (locale === "vi" ? "Tổng thanh toán" : "Total")}</span>
              <span className="text-2xl font-black text-[#0051d5] font-playfair">{formatCurrency(subtotal, locale)}</span>
            </div>

            <Link 
              href={ROUTES.CHECKOUT}
              className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold text-xs py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-md shadow-blue-900/10 active:scale-95"
            >
              <span>{dict?.cart?.secureCheckout || (locale === "vi" ? "Tiến hành thanh toán" : "Proceed to Checkout")}</span>
              <ArrowRight size={14} />
            </Link>

            <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-3 gap-3 opacity-40 grayscale pointer-events-none text-center">
              <div className="h-8 bg-slate-200/80 rounded-lg flex items-center justify-center text-[9px] font-black tracking-wider">VIETQR</div>
              <div className="h-8 bg-slate-200/80 rounded-lg flex items-center justify-center text-[9px] font-black tracking-wider">PAYOS</div>
              <div className="h-8 bg-slate-200/80 rounded-lg flex items-center justify-center text-[9px] font-black tracking-wider">CARDS</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
