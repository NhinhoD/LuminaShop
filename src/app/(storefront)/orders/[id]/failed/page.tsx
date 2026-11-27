import { getOrderAction } from "@/server/presentation/actions/order";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";
import { getLocale } from "@/i18n/getDictionary";
import { getAppDictionary } from "@/server/di/container";
import { StatusBadge } from "@/client/components/orders/StatusBadge";
import { OrderStatus } from "@/server/domain/entities/Order";

export const metadata: Metadata = {
  title: "Thanh toán thất bại",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Order failure/cancelled page displayed when payment is cancelled or failed.
 * Purely read-only display that protects against accidental state mutations on GET requests,
 * redirects completed/paid orders to success, and presents clear status guidance.
 *
 * @param props - Component props containing the async params promise with order ID.
 * @returns JSX Element for the order failed/cancelled page.
 */
export default async function OrderFailedPage(props: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const params = await props.params;

  const result = await getOrderAction(params.id);
  const order = result.data;

  if (!order) {
    redirect("/");
  }

  // If order is already paid or completed, redirect to success certificate
  if (order.status === OrderStatus.COMPLETED || order.paymentStatus === 'paid') {
    redirect(`/orders/${order.id}/success`);
  }

  const locale = await getLocale();
  const dict = await getAppDictionary();
  const orderDict = (dict?.orders as Record<string, string>) || {};

  const isCancelled = order.status === OrderStatus.CANCELLED;

  return (
    <div className="flex-grow bg-background font-sans">
      <div className="mx-auto max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="mono-meta text-[8.5px] text-dark/45">
              ORDER / {order.id.split("-")[0].toUpperCase()}
            </span>
            <span className="mono-meta text-[8px] text-dark/25">KHOUI / STATUS</span>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-error/30 bg-error/5 text-error">
                <XCircle size={22} />
              </span>
              <div className="min-w-0">
                <StatusBadge status={order.status} className="text-[10px] font-semibold" />
                <h1 className="mt-3 display text-[clamp(1.5rem,3vw,2rem)] text-dark">
                  {isCancelled
                    ? (orderDict.failedTitle || (locale === "vi" ? "Giao dịch thanh toán đã bị hủy" : "Payment Cancelled"))
                    : (orderDict.pendingTitle || (locale === "vi" ? "Thanh toán chưa hoàn tất" : "Payment Incomplete"))}
                </h1>
              </div>
            </div>

            <p className="mt-5 border-t border-border pt-5 text-[12.5px] leading-relaxed text-dark/55">
              {isCancelled
                ? (orderDict.failedSubtitle || (locale === "vi" ? "Giao dịch thanh toán đã bị hủy. Đơn hàng của bạn đã được hủy tự động." : "Payment transaction was cancelled. Your order has been automatically cancelled."))
                : (orderDict.pendingSubtitle || (locale === "vi" ? "Đơn hàng đang chờ xử lý thanh toán." : "Order is awaiting payment completion."))}
              {" "}
              <strong className="mono-meta border border-border bg-background px-1.5 py-1 text-[8.5px] text-dark">
                #{order.id.split("-")[0].toUpperCase()}
              </strong>
            </p>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
              <Link
                href={`/profile/orders/${order.id}`}
                className="flex flex-1 items-center justify-center bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
              >
                {orderDict.viewOrderDetail || (locale === "vi" ? "Kiểm tra chi tiết đơn hàng" : "View Order Details")}
              </Link>
              <Link
                href="/shop"
                className="flex flex-1 items-center justify-center border border-border bg-surface px-5 py-3 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
              >
                {orderDict.continueShoppingButton || (locale === "vi" ? "Tiếp tục xem giao diện" : "Browse Templates")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
