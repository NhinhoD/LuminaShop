import { getOrderAction, cancelOrderAction } from "@/server/presentation/actions/order";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";
import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { StatusBadge } from "@/client/components/orders/StatusBadge";
import { OrderStatus } from "@/server/domain/entities/Order";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Order failure/cancelled page displayed when payment is cancelled or failed.
 * Protects against accidental cancellations on GET, redirects paid orders to success,
 * and branches copy appropriately based on actual order status.
 *
 * @param props - Component props containing the async params promise with order ID.
 * @returns JSX Element for the order failed/cancelled page.
 */
export default async function OrderFailedPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const result = await getOrderAction(params.id);
  let order = result.data;

  if (!order) {
    redirect("/");
  }

  // If order is already paid or completed, redirect to success certificate
  if (order.status === OrderStatus.COMPLETED || order.paymentStatus === 'paid') {
    redirect(`/orders/${order.id}/success`);
  }

  // Only auto-cancel pending unpaid orders when returning from payment gateway cancellation
  if (order.status === OrderStatus.PENDING) {
    const cancelRes = await cancelOrderAction(params.id, false);
    if (cancelRes.success && cancelRes.data) {
      order = cancelRes.data;
    }
  }

  const locale = await getLocale();
  const dict = await getAppDictionary();
  const orderDict = (dict?.orders as Record<string, string>) || {};

  const isCancelled = order.status === OrderStatus.CANCELLED;

  return (
    <div className="min-h-screen bg-background-subtle/50 py-16 sm:py-20 px-4 sm:px-6 font-sans">
      <div className="max-w-[640px] mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-xs">
          <XCircle className="w-8 h-8" />
        </div>
        
        <div className="inline-flex items-center gap-2 mb-3">
          <StatusBadge status={order.status} className="text-xs px-3 py-1 font-bold rounded-lg" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-slate-900">
          {isCancelled
            ? (orderDict.failedTitle || (locale === "vi" ? "Giao Dịch Thanh Toán Đã Bị Hủy" : "Payment Cancelled"))
            : (orderDict.pendingTitle || (locale === "vi" ? "Thanh Toán Chưa Hoàn Tất" : "Payment Incomplete"))}
        </h1>
        <p className="text-slate-500 text-xs mb-8 max-w-md mx-auto leading-relaxed font-normal">
          {isCancelled
            ? (orderDict.failedSubtitle || (locale === "vi" ? "Giao dịch thanh toán đã bị hủy. Đơn hàng của bạn đã được hủy tự động." : "Payment transaction was cancelled. Your order has been automatically cancelled."))
            : (orderDict.pendingSubtitle || (locale === "vi" ? "Đơn hàng đang chờ xử lý thanh toán." : "Order is awaiting payment completion."))}
          {" "}
          <strong className="text-slate-900 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
            #{order.id.split("-")[0].toUpperCase()}
          </strong>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3.5">
          <Link 
            href={`/profile/orders/${order.id}`} 
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all text-sm shadow-xs active:scale-95 text-center"
          >
            {orderDict.viewOrderDetail || (locale === "vi" ? "Kiểm tra chi tiết đơn hàng" : "View Order Details")}
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

