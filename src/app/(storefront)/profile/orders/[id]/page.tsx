import { getOrderAction } from "@/server/presentation/actions/order";
import { verifyOrderPaymentAction } from "@/server/presentation/actions/payment";
import { OrderRealtimeTracker } from "@/client/components/orders/OrderRealtimeTracker";
import { StatusBadge } from "@/client/components/orders/StatusBadge";
import { CancelOrderButton } from "@/client/components/orders/CancelOrderButton";
import { cn } from "@/shared/utils";
import { formatCurrency, formatDate, resolveCleanPreviewUrl } from "@/shared/utils";
import { BackButton } from "@/client/components/common/BackButton";
import Link from "next/link";
import { Package, MapPin, CreditCard, ShoppingBag, Download, ExternalLink, CheckCircle2, QrCode, AlertTriangle, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "@/client/components/common/ImageWithFallback";
import { OrderStatus } from "@/server/domain/entities/Order";
import { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/shared/utils/locale";
import { makeLanguageRepository, makeGetProductByIdUseCase } from "@/server/di/container";

export const metadata: Metadata = {
  title: { absolute: "Chi tiết đơn hàng | KhoUI" },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Order details and payment tracking page.
 * Displays order items, license downloads, payment summary, and cancellation actions.
 * Limits synchronous payment verification to unresolved pending orders to prevent page render delay.
 *
 * @param props - Component props with async params promise.
 * @returns JSX Element for the order detail page.
 */
export default async function OrderDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  
  // Load order first
  let response = await getOrderAction(id);

  // Auto-sync payment status only for unresolved pending orders (prevents slow network blocking on paid/cancelled orders)
  if (
    response.success &&
    response.data &&
    response.data.paymentStatus !== 'paid' &&
    response.data.status === OrderStatus.PENDING
  ) {
    await verifyOrderPaymentAction(id, false);
    // Reload order after verification to reflect newly reconciled status (e.g. paid, cancelled, or expired)
    response = await getOrderAction(id);
  }
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const orderDict = (dict?.orders as Record<string, string>) || {};
  const commonDict = (dict?.common as Record<string, string>) || {};
  const cartDict = (dict?.cart as Record<string, string>) || {};

  if (!response.success) {
    return (
      <div className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-lg px-5">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {orderDict.orderNotFound || (locale === "vi" ? "Không tìm thấy đơn hàng" : "Order Not Found")}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">{response.error}</p>
            <div className="mt-6 flex border-t border-border pt-5">
              <BackButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const order = response.data;

  if (!order) {
    return (
      <div className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-lg px-5">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {commonDict.error || (locale === "vi" ? "Lỗi dữ liệu" : "Data Error")}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {locale === "vi" ? "Không thể tải thông tin chi tiết đơn hàng." : "Unable to load order details."}
            </p>
            <div className="mt-6 flex border-t border-border pt-5">
              <BackButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch the actual products for the order items to retrieve their active download/demo URLs
  const getProductUseCase = await makeGetProductByIdUseCase();
  
  const itemsWithCode = await Promise.all(
    order.items.map(async (item) => {
      try {
        const prodResult = await getProductUseCase.execute(item.productId);
        if (!prodResult.success) {
          console.error("ProfileOrderDetailPage: failed to fetch product details:", prodResult.error);
          return {
            ...item,
            sourceCodeUrl: "",
            demoUrl: "",
            lookupError: true,
          };
        }
        const prod = prodResult.data;
        return {
          ...item,
          sourceCodeUrl: prod?.sourceCodeUrl || "",
          demoUrl: prod?.demoUrl || "",
          lookupError: false,
        };
      } catch (err) {
        console.error("ProfileOrderDetailPage: product lookup exception:", err);
        return {
          ...item,
          sourceCodeUrl: "",
          demoUrl: "",
          lookupError: true,
        };
      }
    })
  );

  const hasProductLookupError = itemsWithCode.some((item) => item.lookupError);

  const isOrderPaid = (order.paymentStatus === 'paid' || order.status === OrderStatus.COMPLETED) && order.status !== OrderStatus.CANCELLED;

  return (
    <div className="flex-grow bg-background font-sans">
      <OrderRealtimeTracker orderId={order.id} initialStatus={order.status} />

      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Order Details */}
          <div className="space-y-6 lg:col-span-8">
            {/* Header & Timeline */}
            <section className="border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/45">
                  03 / {orderDict.orderDetailsTitle || (locale === "vi" ? "Chi tiết đơn hàng" : "Order Details")}
                </span>
                <StatusBadge status={order.status} className="text-[10px] font-semibold" />
              </div>

              <div className="p-5 sm:p-6">
                <h1 className="display text-[clamp(1.4rem,2.6vw,1.9rem)] text-dark">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="mono-meta mt-2 flex flex-wrap items-center gap-2 text-[8.5px] text-dark/40">
                  <span>{orderDict.onlineOrder || (locale === "vi" ? "Trực tuyến" : "Online")}</span>
                  <span className="text-dark/20">/</span>
                  <span>{formatDate(order.createdAt, locale)}</span>
                </div>

                {isOrderPaid && (
                  <div className="mt-5 flex items-center gap-2.5 border border-success/30 border-l-2 border-l-success bg-success/5 px-3.5 py-3">
                    <CheckCircle2 size={14} className="shrink-0 text-success" />
                    <span className="text-[11.5px] font-medium text-dark/75">
                      {orderDict.orderPaidSuccess || (locale === "vi" ? "Đơn hàng đã được kích hoạt bản quyền thành công" : "Order has been activated and licensed successfully")}
                    </span>
                  </div>
                )}

                {order.status === OrderStatus.PENDING && (
                  <div className="mt-5 flex justify-end border-t border-border pt-4">
                    <CancelOrderButton orderId={order.id} />
                  </div>
                )}
              </div>
            </section>

            {/* Items & Download Panel */}
            <section className="border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <ShoppingBag size={12} className="text-primary" />
                <h2 className="mono-meta text-[8.5px] text-dark/55">
                  {orderDict.ownedSourcePackages || (locale === "vi" ? "Gói mã nguồn sở hữu" : "Owned Source Code Packages")}
                </h2>
              </div>

              {hasProductLookupError && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/30 bg-primary/5 px-4 py-3 text-[11px] text-primary">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{locale === "vi" ? "Có lỗi kết nối khi tải liên kết mã nguồn cho một số sản phẩm." : "Failed to retrieve source code download links for some items due to a connection error."}</span>
                  </div>
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="inline-flex shrink-0 items-center gap-1 font-semibold underline"
                  >
                    <RefreshCw size={11} />
                    <span>{locale === "vi" ? "Tải lại" : "Reload"}</span>
                  </Link>
                </div>
              )}

              <div className="divide-y divide-border">
                {itemsWithCode.map((item) => (
                  <div key={item.id} className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden border border-border bg-background-subtle">
                        {item.productSnapshot?.image_url || item.productSnapshot?.image ? (
                          <ImageWithFallback
                            src={item.productSnapshot.image_url || item.productSnapshot.image || ""}
                            alt={getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || "Product"}
                            fill
                            className="object-cover"
                            fallbackElement={<Package className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-dark/25" />}
                          />
                        ) : (
                          <Package className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-dark/25" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-dark">
                          {getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || (locale === "vi" ? "Sản phẩm không xác định" : "Unknown Product")}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="mono-meta border border-border bg-background px-1.5 py-1 text-[7.5px] text-dark/50">
                            {orderDict.licenseCode || "SKU:"} {item.productId.slice(0, 6).toUpperCase()}
                          </span>
                          <span className="mono-meta border border-primary/30 bg-primary/5 px-1.5 py-1 text-[7.5px] text-primary">
                            {orderDict.lifetimeLicenseBadge || (locale === "vi" ? "CẤP PHÉP TRỌN ĐỜI" : "LIFETIME LICENSE")}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-[13px] font-semibold text-dark">
                        {formatCurrency(Number(item.priceAtPurchase), locale)}
                      </div>
                    </div>

                    {/* HIGH-CONTRAST DIGITAL DOWNLOAD DRAWER */}
                    {isOrderPaid ? (
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        {item.lookupError ? (
                          <div className="flex flex-1 flex-wrap items-center justify-between gap-2 border border-primary/30 bg-primary/5 px-3 py-2.5 text-[11px] text-primary">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={13} className="shrink-0" />
                              <span>{locale === "vi" ? "Không thể tải liên kết mã nguồn từ máy chủ" : "Failed to retrieve source code link"}</span>
                            </div>
                            <Link
                              href={`/profile/orders/${order.id}`}
                              className="inline-flex shrink-0 items-center gap-1 font-semibold underline"
                            >
                              <RefreshCw size={11} />
                              <span>{locale === "vi" ? "Thử lại" : "Retry"}</span>
                            </Link>
                          </div>
                        ) : item.sourceCodeUrl ? (
                          <a
                            href={item.sourceCodeUrl}
                            className="inline-flex flex-1 items-center justify-center gap-2 bg-dark px-4 py-2.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
                          >
                            <Download size={13} />
                            <span>{orderDict.downloadSourceCode || (locale === "vi" ? "Tải source code (.zip)" : "Download Source Code (.zip)")}</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 border border-border bg-background-subtle px-4 py-2.5 text-[11.5px] font-medium text-dark/40"
                          >
                            <Download size={13} />
                            <span>{orderDict.preparingDownload || (locale === "vi" ? "Đang chuẩn bị file tải lên..." : "Preparing upload file...")}</span>
                          </button>
                        )}

                        {item.demoUrl && (
                          <a
                            href={resolveCleanPreviewUrl(item.demoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border border-border bg-surface px-4 py-2.5 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
                          >
                            <ExternalLink size={13} />
                            <span>{orderDict.liveDemoBtn || (locale === "vi" ? "Xem Demo trực tiếp" : "Live Demo")}</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-[11px] text-primary">
                        <span className="h-1.5 w-1.5 shrink-0 animate-pulse bg-primary" />
                        <span>
                          {orderDict.transferVerifying || (locale === "vi" ? "Giao dịch chuyển khoản đang được xác nhận. Link tải code sẽ tự động hiển thị tại đây khi hoàn tất." : "Bank transfer verification in progress. Download links will appear here immediately once verified.")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border bg-background-subtle/40 p-4 sm:p-5">
                <div className="flex justify-between text-[11.5px] text-dark/50">
                  <span>{cartDict.subtotal || (locale === "vi" ? "Tạm tính" : "Subtotal")}</span>
                  <span className="font-mono font-medium text-dark">{formatCurrency(order.totalAmount, locale)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[12px] font-semibold text-dark">{orderDict.total || (locale === "vi" ? "Tổng cộng" : "Total Amount")}</span>
                  <span className="font-mono text-[1.05rem] font-semibold text-primary">
                    {formatCurrency(order.totalAmount, locale)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Customer & License Info */}
          <div className="space-y-6 lg:col-span-4">
            {/* Digital Email Delivery */}
            <section className="border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <MapPin size={12} className="text-primary" />
                <h2 className="mono-meta text-[8.5px] text-dark/55">
                  {orderDict.accountDeliverInfo || (locale === "vi" ? "Thông tin tài khoản nhận mã nguồn" : "Source Code Recipient Account")}
                </h2>
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                <p className="text-[12.5px] font-semibold text-dark">{order.shippingAddress?.fullName}</p>
                <div className="border border-border bg-background p-3">
                  <span className="mono-meta block text-[7.5px] text-dark/35">
                    {orderDict.deployEnvironment || (locale === "vi" ? "Môi trường nhận code (Email)" : "Delivery Destination (Email)")}
                  </span>
                  <span className="mt-1 block break-all font-mono text-[11px] text-dark/70">{order.shippingAddress?.street}</span>
                </div>
                <div className="font-mono text-[10.5px] text-dark/40">
                  {orderDict.contactSupportChannel || (locale === "vi" ? "Kênh liên hệ hỗ trợ:" : "Support Contact Channel:")} {order.shippingAddress?.phone}
                </div>
              </div>
            </section>

            {/* Payment Info */}
            <section className="border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <CreditCard size={12} className="text-primary" />
                <h2 className="mono-meta text-[8.5px] text-dark/55">
                  {orderDict.paymentMethod || (locale === "vi" ? "Thanh toán" : "Payment Details")}
                </h2>
              </div>
              <div className="space-y-px bg-border">
                <div className="flex items-center justify-between gap-2 bg-surface px-4 py-2.5 text-[11px]">
                  <span className="text-dark/50">
                    {orderDict.paymentMethod || "Method"}
                  </span>
                  <span className="font-mono font-medium uppercase text-dark">
                    {order.paymentMethod === 'cod' ? 'Manual VietQR' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-surface px-4 py-2.5 text-[11px]">
                  <span className="text-dark/50">
                    {orderDict.paymentStatusLabel || (locale === "vi" ? "Trạng thái" : "Status")}
                  </span>
                  <span className={cn(
                    "font-medium",
                    order.status === OrderStatus.CANCELLED || order.paymentStatus === 'failed'
                      ? "text-error"
                      : order.paymentStatus === 'paid'
                      ? "text-success"
                      : "text-primary"
                  )}>
                    {order.status === OrderStatus.CANCELLED || order.paymentStatus === 'failed'
                      ? (orderDict.paymentCancelled || (locale === "vi" ? "Đã hủy" : "Cancelled"))
                      : order.paymentStatus === 'paid'
                      ? (orderDict.paymentPaid || (locale === "vi" ? "Đã xác nhận" : "Verified & Paid"))
                      : (orderDict.paymentPending || (locale === "vi" ? "Đang chờ duyệt" : "Awaiting Verification"))}
                  </span>
                </div>
              </div>
            </section>

            {/* Quick Bank Transfer details if not paid yet and order is pending */}
            {!isOrderPaid && order.status === OrderStatus.PENDING && (
              <section className="border border-border bg-surface">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <QrCode size={12} className="text-primary" />
                  <h3 className="mono-meta text-[8.5px] text-dark/55">
                    {orderDict.bankTransferGuide || (locale === "vi" ? "Hướng dẫn chuyển khoản" : "Bank Transfer Instructions")}
                  </h3>
                </div>
                <div className="space-y-2.5 p-4 text-[11px] leading-relaxed">
                  {[
                    { label: orderDict.bankName || "Bank", value: "MB BANK (Ngân hàng Quân Đội)" },
                    { label: orderDict.bankAccountNo || "Account No", value: "999988886666" },
                    { label: orderDict.bankAccountHolder || "Account Holder", value: "PHUNG XUAN DUONG" },
                  ].map((row) => (
                    <div key={row.label}>
                      <span className="mono-meta block text-[7.5px] text-dark/35">{row.label}</span>
                      <span className="mt-0.5 block font-mono font-medium text-dark">{row.value}</span>
                    </div>
                  ))}
                  <div>
                    <span className="mono-meta block text-[7.5px] text-dark/35">{orderDict.bankContent || "Transfer Memo"}</span>
                    <span className="mono-meta mt-1 inline-block border border-primary/30 bg-primary/5 px-1.5 py-1 text-[8px] text-primary">
                      KHOUI {order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Digital Handover Shield */}
            <section className="border border-dark bg-dark p-4 sm:p-5">
              <div className="flex items-center gap-2 border-b border-background/10 pb-2.5">
                <ShoppingBag size={13} className="text-primary" />
                <h2 className="mono-meta text-[8.5px] text-background/60">
                  {orderDict.sourceDeliveryTitle || (locale === "vi" ? "Bàn giao mã nguồn" : "Source Code Handover")}
                </h2>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-background/60">
                {order.status === OrderStatus.CANCELLED
                  ? (orderDict.sourceDeliveryCancelled || (locale === "vi" ? "Đơn hàng này đã bị hủy do giao dịch thanh toán không thành công hoặc bị hủy. Bản quyền và mã nguồn chưa được kích hoạt." : "This order was cancelled due to incomplete or cancelled payment. Source code and licensing have not been activated."))
                  : isOrderPaid
                  ? (orderDict.sourceDeliveryPaid || (locale === "vi" ? "Bản quyền đã kích hoạt! Hãy nhấn vào nút 'Tải về Source Code' bên dưới sản phẩm để tải file mã nguồn dạng .zip." : "License active! Click 'Download Source Code' below each item to retrieve the .zip package."))
                  : (orderDict.sourceDeliveryPending || (locale === "vi" ? "Đơn hàng đang chờ xác nhận giao dịch chuyển khoản. Vui lòng hoàn thành chuyển khoản để kích hoạt link tải tự động." : "Order is awaiting bank payment confirmation. Please complete the transfer to unlock instant downloads."))
                }
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
