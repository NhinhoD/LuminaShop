import { getOrderAction } from "@/presentation/actions/order";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";

export default async function OrderFailedPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    <div className="max-w-[800px] mx-auto px-6 py-20 text-center font-sans">
      <div className="flex justify-center mb-6">
        <AlertCircle className="w-24 h-24 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4 font-sans text-slate-900">
        {orderDict.failedTitle || (locale === "vi" ? "Thanh toán chưa hoàn tất!" : "Payment Incomplete!")}
      </h1>
      <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">
        {orderDict.failedSubtitle || (locale === "vi" ? "Đã có lỗi hoặc giao dịch chưa được xác nhận cho đơn hàng" : "An error occurred or payment verification is still pending for order")}{" "}
        <strong>#{order.id.split("-")[0].toUpperCase()}</strong>.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href={`/checkout`} 
          className="px-8 py-4 bg-[#0051d5] text-white rounded-xl font-bold hover:bg-[#0041ac] transition-all text-xs uppercase tracking-wider shadow-md"
        >
          {orderDict.retryPayment || (locale === "vi" ? "Thử thanh toán lại" : "Retry Payment")}
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
