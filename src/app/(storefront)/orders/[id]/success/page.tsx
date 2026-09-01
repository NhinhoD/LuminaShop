import { getOrderAction } from "@/presentation/actions/order";
import { verifyOrderPaymentAction } from "@/presentation/actions/payment";
import { OrderItem } from "@/domain/entities/Order";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";

export default async function OrderSuccessPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  // Verify payment status (especially for PayOS on localhost where webhook might not reach)
  await verifyOrderPaymentAction(params.id, false);
  
  const result = await getOrderAction(params.id);
  const order = result.data;
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const orderDict = (dict?.orders as Record<string, string>) || {};

  if (!order) {
    redirect("/");
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 text-center font-manrope">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-24 h-24 text-emerald-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4 font-playfair text-slate-900">
        {orderDict.successTitle || (locale === "vi" ? "Đặt hàng thành công!" : "Order Placed Successfully!")}
      </h1>
      <p className="text-slate-500 text-base mb-8">
        {orderDict.successSubtitle || (locale === "vi" ? "Cảm ơn bạn đã mua sắm tại KhoUI. Mã đơn hàng của bạn là" : "Thank you for your purchase at KhoUI. Your order code is")}{" "}
        <strong>#{order.id.split("-")[0].toUpperCase()}</strong>
      </p>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 text-left mb-10 shadow-sm max-w-[500px] mx-auto">
        <h2 className="font-bold text-lg mb-6 pb-4 border-b border-slate-100 font-playfair text-slate-900">
          {orderDict.summaryTitle || (locale === "vi" ? "Tóm tắt đơn hàng" : "Order Summary")}
        </h2>
        
        <div className="space-y-4 mb-6">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <p className="font-bold text-slate-900">
                  {getLocalizedText(item.productSnapshot?.title as unknown as Record<string, string>, locale) || getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || (locale === "vi" ? "Sản phẩm" : "Product")}
                </p>
                <p className="text-slate-400 text-xs">{orderDict.quantity || (locale === "vi" ? "Số lượng:" : "Quantity:")} {item.quantity}</p>
              </div>
              <span className="font-extrabold text-slate-900">{formatCurrency(item.priceAtPurchase * item.quantity, locale)}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">{orderDict.paymentMethod || (locale === "vi" ? "Phương thức thanh toán:" : "Payment Method:")}</span>
            <span className="font-bold uppercase text-slate-900">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{orderDict.activationStatus || (locale === "vi" ? "Tình trạng kích hoạt:" : "Fulfillment Status:")}</span>
            <span className="font-extrabold text-right text-emerald-600">
              {orderDict.autoActivation || (locale === "vi" ? "Tự động kích hoạt sau khi thanh toán" : "Instant automated digital delivery")}
            </span>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between font-bold text-lg">
          <span className="text-slate-900">{orderDict.total || (locale === "vi" ? "Tổng cộng" : "Total Amount")}</span>
          <span className="text-[#0051d5] font-playfair font-black">{formatCurrency(order.totalAmount, locale)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/profile/orders" 
          className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-xs uppercase tracking-wider shadow-md"
        >
          {orderDict.viewOrdersButton || (locale === "vi" ? "Xem kho giao diện" : "View Purchased Templates")}
        </Link>
        <Link 
          href="/shop" 
          className="px-8 py-4 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
        >
          {orderDict.continueShoppingButton || (locale === "vi" ? "Tiếp tục mua sắm" : "Continue Browsing")}
        </Link>
      </div>
    </div>
  );
}
