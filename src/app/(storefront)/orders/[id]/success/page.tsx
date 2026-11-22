import { getOrderAction } from "@/server/presentation/actions/order";
import type { Metadata } from "next";
import { verifyOrderPaymentAction } from "@/server/presentation/actions/payment";
import { OrderItem } from "@/server/domain/entities/Order";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/shared/utils/locale";
import { makeGetProductByIdUseCase, getAppDictionary } from "@/server/di/container";

export const metadata: Metadata = {
  title: "Xác nhận đơn hàng thành công",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Order success confirmation page displayed after successful payment.
 * Verifies payment status, displays order summary with licensed assets, and provides download/installation instructions.
 */
export default async function OrderSuccessPage(props: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const params = await props.params;

  // Verify payment status (especially for PayOS on localhost where webhook might not reach)
  await verifyOrderPaymentAction(params.id, false);

  const result = await getOrderAction(params.id);
  const order = result.data;
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const orderDict = (dict?.orders as Record<string, string>) || {};

  if (!order) {
    redirect("/");
  }

  if (order.status === "cancelled" || order.paymentStatus === "failed") {
    redirect(`/orders/${params.id}/failed`);
  }

  // Fetch product models to retrieve active source code download URLs
  const getProductUseCase = await makeGetProductByIdUseCase();
  const itemsWithCode = await Promise.all(
    order.items.map(async (item: OrderItem) => {
      try {
        const prodResult = await getProductUseCase.execute(item.productId);
        if (!prodResult.success) {
          console.error("OrderSuccessPage: failed to fetch product details:", prodResult.error);
          return {
            ...item,
            sourceCodeUrl: "",
            lookupError: true,
          };
        }
        return {
          ...item,
          sourceCodeUrl: prodResult.data?.sourceCodeUrl || "",
          lookupError: false,
        };
      } catch (err) {
        console.error("OrderSuccessPage: product lookup exception:", err);
        return {
          ...item,
          sourceCodeUrl: "",
          lookupError: true,
        };
      }
    })
  );

  const hasProductLookupError = itemsWithCode.some((item) => item.lookupError);

  const isPaid = order.paymentStatus === "paid" || order.status === "completed";

  return (
    <div className="flex-grow bg-background font-sans">
      <div className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
        {/* Header */}
        <header className="border-b border-border pb-8">
          <span className="mono-meta flex flex-wrap items-center gap-2 text-success">
            <span className="h-1.5 w-1.5 bg-success" />
            {orderDict.certificateBadge || (locale === "vi" ? "Chứng nhận bản quyền kỹ thuật số" : "Digital License Certificate")}
          </span>

          <div className="mt-5 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-success/30 bg-success/5 text-success">
              <CheckCircle2 size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="display text-[clamp(1.6rem,3.2vw,2.4rem)] text-dark">
                {orderDict.successTitle || (locale === "vi" ? "Thanh toán thành công!" : "Payment Confirmed!")}
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-dark/55">
                {orderDict.successSubtitle || (locale === "vi" ? "Giấy phép bản quyền thương mại và mã nguồn đã được kích hoạt thành công cho đơn hàng" : "Commercial license and source code access have been granted for order")}{" "}
                <strong className="mono-meta border border-border bg-surface px-1.5 py-1 text-[8.5px] text-dark">
                  #{order.id.split("-")[0].toUpperCase()}
                </strong>
              </p>
            </div>
          </div>
        </header>

        {/* Lookup Failure Alert Banner */}
        {hasProductLookupError && (
          <div className="mt-6 flex items-start gap-3 border border-primary/30 border-l-2 border-l-accent bg-primary/5 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h3 className="text-[12px] font-semibold text-dark">
                {locale === "vi" ? "Không thể tải thông tin file mã nguồn" : "Failed to load download link"}
              </h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-dark/55">
                {locale === "vi"
                  ? "Hệ thống đã xác nhận thanh toán thành công, nhưng tạm thời gặp lỗi khi lấy liên kết mã nguồn. Vui lòng tải lại trang hoặc kiểm tra trong kho giao diện của bạn."
                  : "Your payment was confirmed, but retrieving download links failed. Please reload this page or access your purchased templates in profile."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/orders/${params.id}/success`}
                  className="inline-flex items-center gap-1.5 bg-dark px-3 py-2 text-[11px] font-semibold text-background transition-colors hover:bg-primary"
                >
                  <RefreshCw size={12} />
                  <span>{locale === "vi" ? "Tải lại trang" : "Reload"}</span>
                </Link>
                <Link
                  href="/profile/orders"
                  className="border border-border bg-surface px-3 py-2 text-[11px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
                >
                  {locale === "vi" ? "Vào kho giao diện của tôi" : "Access My Templates Vault"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Digital License Receipt Card */}
        <section className="mt-6 border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
            <h2 className="mono-meta text-[8.5px] text-dark/55">
              {orderDict.summaryTitle || (locale === "vi" ? "Thông tin bản quyền đã cấp" : "Licensed Assets Summary")}
            </h2>
            <span className="mono-meta flex items-center gap-1.5 border border-success/30 bg-success/5 px-1.5 py-1 text-[7.5px] text-success">
              <span className="h-1 w-1 bg-success" />
              {orderDict.verifiedAndActive || (locale === "vi" ? "Đã xác thực & kích hoạt" : "Verified & Active")}
            </span>
          </div>

          <div className="divide-y divide-border">
            {itemsWithCode.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-dark">
                    {getLocalizedText(item.productSnapshot?.title as unknown as Record<string, string>, locale) || getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || (locale === "vi" ? "Sản phẩm" : "Product")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-dark/45">
                    {orderDict.singleCommercialLicense || (locale === "vi" ? "Giấy phép thương mại vĩnh viễn (Single Commercial)" : "Lifetime Commercial License")}
                  </p>
                </div>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <span className="font-mono text-[13px] font-semibold text-dark">
                    {formatCurrency(item.priceAtPurchase * item.quantity, locale)}
                  </span>
                  {item.lookupError ? (
                    <div className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/5 px-2 py-1.5 text-[10.5px] font-medium text-primary">
                      <AlertTriangle size={11} />
                      <span>{locale === "vi" ? "Lỗi tải link" : "Link unavailable"}</span>
                      <Link href={`/orders/${params.id}/success`} className="font-semibold underline">
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : isPaid && item.sourceCodeUrl ? (
                    <a
                      href={item.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 bg-dark px-3 py-2 text-[11px] font-semibold text-background transition-colors hover:bg-primary"
                    >
                      <Download size={12} />
                      <span>{locale === "vi" ? "Tải source code" : "Download (.zip)"}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-px border-t border-border bg-border">
            <div className="flex justify-between gap-2 bg-surface px-4 py-2.5 text-[11.5px]">
              <span className="text-dark/50">{orderDict.paymentGateway || orderDict.paymentMethod || (locale === "vi" ? "Cổng thanh toán:" : "Payment Gateway:")}</span>
              <span className="font-mono font-semibold uppercase text-dark">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-2 bg-surface px-4 py-2.5 text-[11.5px]">
              <span className="text-dark/50">{orderDict.fulfillmentStatus || orderDict.activationStatus || (locale === "vi" ? "Trạng thái bàn giao:" : "Fulfillment Status:")}</span>
              <span className="font-medium text-success">
                {orderDict.instantFulfillment || (locale === "vi" ? "Tự động cấp quyền tức thì" : "Instant automated delivery")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-surface px-4 py-3.5">
              <span className="text-[12px] font-semibold text-dark">
                {orderDict.total || (locale === "vi" ? "Tổng thanh toán" : "Total Amount")}
              </span>
              <span className="font-mono text-[1.05rem] font-semibold text-primary">
                {formatCurrency(order.totalAmount, locale)}
              </span>
            </div>
          </div>
        </section>

        {/* Quick Start Installation Box */}
        <section className="mt-6 border border-dark bg-dark">
          <div className="flex items-center gap-1.5 border-b border-background/10 px-4 py-2.5">
            <span className="h-2 w-2 bg-error" />
            <span className="h-2 w-2 bg-primary" />
            <span className="h-2 w-2 bg-success" />
            <span className="mono-meta ml-2 text-[8px] text-background/45">
              {orderDict.quickStartGuide || (locale === "vi" ? "Hướng dẫn cài đặt nhanh" : "Quick Start Setup Guide")}
            </span>
          </div>
          <div className="space-y-1.5 p-4 font-mono text-[11.5px] leading-relaxed">
            <p className="text-background/35">{orderDict.quickStep1 || (locale === "vi" ? "# 1. Tải và giải nén file .zip từ kho giao diện" : "# 1. Download and unzip .zip file from vault")}</p>
            <p className="text-success">$ unzip template-source.zip -d ./my-project</p>
            <p className="pt-1.5 text-background/35">{orderDict.quickStep2 || (locale === "vi" ? "# 2. Cài đặt các gói phụ thuộc" : "# 2. Install package dependencies")}</p>
            <p className="text-success">$ cd my-project &amp;&amp; npm install</p>
            <p className="pt-1.5 text-background/35">{orderDict.quickStep3 || (locale === "vi" ? "# 3. Khởi chạy môi trường phát triển local" : "# 3. Start local development server")}</p>
            <p className="text-success">$ npm run dev</p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {hasProductLookupError ? (
            <Link
              href={`/orders/${params.id}/success`}
              className="flex items-center justify-center gap-2 bg-primary px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-dark"
            >
              <RefreshCw size={14} />
              <span>{locale === "vi" ? "Thử tải lại liên kết" : "Retry Loading Links"}</span>
            </Link>
          ) : isPaid && itemsWithCode.length === 1 && itemsWithCode[0].sourceCodeUrl ? (
            <a
              href={itemsWithCode[0].sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-primary px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-dark"
            >
              <Download size={14} />
              <span>{locale === "vi" ? "Tải ngay source code (.zip)" : "Download Source Code (.zip)"}</span>
            </a>
          ) : null}
          <Link
            href="/profile/orders"
            className="flex items-center justify-center gap-2 bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
          >
            <Download size={14} />
            <span>{orderDict.accessVaultButton || orderDict.viewOrdersButton || (locale === "vi" ? "Vào kho giao diện của tôi" : "Access My Templates Vault")}</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 border border-border bg-surface px-5 py-3 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
          >
            {orderDict.continueShoppingButton || (locale === "vi" ? "Khám phá thêm template" : "Browse More Templates")}
          </Link>
        </div>
      </div>
    </div>
  );
}
