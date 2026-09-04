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
    <div className="min-h-screen bg-background-subtle/50 py-16 sm:py-20 px-4 sm:px-6 font-sans">
      <div className="max-w-[640px] mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-slate-900">
          {orderDict.failedTitle || (locale === "vi" ? "Thanh Toán Chưa Hoàn Tất" : "Payment Pending or Incomplete")}
        </h1>
        <p className="text-slate-500 text-xs mb-8 max-w-md mx-auto leading-relaxed font-normal">
          {orderDict.failedSubtitle || (locale === "vi" ? "Giao dịch chuyển khoản chưa được xác nhận hoặc đã bị hủy cho đơn hàng" : "Bank transfer verification is pending or was cancelled for order")}{" "}
          <strong className="text-slate-900 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
            #{order.id.split("-")[0].toUpperCase()}
          </strong>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3.5">
          <Link 
            href={`/checkout`} 
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all text-sm shadow-xs active:scale-95 text-center"
          >
            {orderDict.retryPayment || (locale === "vi" ? "Thử thanh toán lại" : "Retry Payment")}
          </Link>
          <Link 
            href="/shop" 
            className="px-6 py-3 bg-white border border-slate-200/80 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95 text-center shadow-xs"
          >
            {orderDict.continueShoppingButton || (locale === "vi" ? "Tiếp tục xem giao diện" : "Browse Templates")}
          </Link>
        </div>
      </div>
    </div>
  );
}
