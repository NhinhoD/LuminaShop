import { getOrderAction } from "@/presentation/actions/order";
import { verifyOrderPaymentAction } from "@/presentation/actions/payment";
import { OrderItem } from "@/domain/entities/Order";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { makeGetProductByIdUseCase, getAppDictionary } from "@/di/container";

/**
 * Order success confirmation page displayed after successful payment.
 * Verifies payment status, displays order summary with licensed assets, and provides download/installation instructions.
 */
export default async function OrderSuccessPage(props: { params: Promise<{ id: string }> }) {
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
    <div className="min-h-screen bg-background-subtle/50 py-16 sm:py-20 px-4 sm:px-6 font-sans">
      <div className="max-w-[720px] mx-auto text-center">
        
        {/* Certificate Badge & Icon */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold tracking-wider uppercase mb-6 shadow-2xs">
          <span>{orderDict.certificateBadge || (locale === "vi" ? "Chứng nhận Bản quyền Kỹ thuật số" : "Digital License Certificate")}</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          {orderDict.successTitle || (locale === "vi" ? "Thanh Toán Thành Công!" : "Payment Confirmed!")}
        </h1>
        <p className="text-slate-500 text-xs max-w-lg mx-auto mb-10 leading-relaxed font-normal">
          {orderDict.successSubtitle || (locale === "vi" ? "Giấy phép bản quyền thương mại và mã nguồn đã được kích hoạt thành công cho đơn hàng" : "Commercial license and source code access have been granted for order")}{" "}
          <strong className="text-slate-900 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
            #{order.id.split("-")[0].toUpperCase()}
          </strong>
        </p>

        {/* Lookup Failure Alert Banner */}
        {hasProductLookupError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left mb-8 flex items-start gap-3.5 shadow-xs">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 text-xs text-amber-800">
              <h3 className="font-semibold text-amber-900 text-sm">
                {locale === "vi" ? "Không thể tải thông tin file mã nguồn" : "Failed to load download link"}
              </h3>
              <p className="mt-1 leading-relaxed">
                {locale === "vi" 
                  ? "Hệ thống đã xác nhận thanh toán thành công, nhưng tạm thời gặp lỗi khi lấy liên kết mã nguồn. Vui lòng tải lại trang hoặc kiểm tra trong kho giao diện của bạn."
                  : "Your payment was confirmed, but retrieving download links failed. Please reload this page or access your purchased templates in profile."}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Link
                  href={`/orders/${params.id}/success`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>{locale === "vi" ? "Tải lại trang" : "Reload"}</span>
                </Link>
                <Link
                  href="/profile/orders"
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-medium hover:bg-amber-100/50 transition-colors"
                >
                  {locale === "vi" ? "Vào Kho Giao Diện Của Tôi" : "Access My Templates Vault"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Digital License Receipt Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 text-left mb-8 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <h2 className="font-semibold text-base tracking-tight text-slate-900">
              {orderDict.summaryTitle || (locale === "vi" ? "Thông tin bản quyền đã cấp" : "Licensed Assets Summary")}
            </h2>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {orderDict.verifiedAndActive || (locale === "vi" ? "Đã xác thực & Kích hoạt" : "Verified & Active")}
            </span>
          </div>
          
          <div className="space-y-4 mb-6">
            {itemsWithCode.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2 border-b border-slate-50 last:border-0 text-sm">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-slate-900 tracking-tight text-sm">
                    {getLocalizedText(item.productSnapshot?.title as unknown as Record<string, string>, locale) || getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || (locale === "vi" ? "Sản phẩm" : "Product")}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 font-normal">
                    {orderDict.singleCommercialLicense || (locale === "vi" ? "Giấy phép thương mại vĩnh viễn (Single Commercial)" : "Lifetime Commercial License")}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-bold text-slate-900 font-mono text-sm">{formatCurrency(item.priceAtPurchase * item.quantity, locale)}</span>
                  {item.lookupError ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                      <AlertTriangle size={12} className="text-amber-600" />
                      <span>{locale === "vi" ? "Lỗi tải link" : "Link unavailable"}</span>
                      <Link href={`/orders/${params.id}/success`} className="underline font-semibold ml-1">
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : isPaid && item.sourceCodeUrl ? (
                    <a
                      href={item.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 flex-shrink-0"
                    >
                      <Download size={13} />
                      <span>{locale === "vi" ? "Tải source code" : "Download (.zip)"}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-normal">{orderDict.paymentGateway || orderDict.paymentMethod || (locale === "vi" ? "Cổng thanh toán:" : "Payment Gateway:")}</span>
              <span className="font-medium uppercase text-slate-900 font-mono">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-normal">{orderDict.fulfillmentStatus || orderDict.activationStatus || (locale === "vi" ? "Trạng thái bàn giao:" : "Fulfillment Status:")}</span>
              <span className="font-medium text-emerald-600">
                {orderDict.instantFulfillment || (locale === "vi" ? "Tự động cấp quyền tức thì" : "Instant automated delivery")}
              </span>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 flex justify-between items-center text-base">
            <span className="text-slate-900 text-sm font-medium tracking-tight">{orderDict.total || (locale === "vi" ? "Tổng thanh toán" : "Total Amount")}</span>
            <span className="text-primary font-mono text-xl font-bold">{formatCurrency(order.totalAmount, locale)}</span>
          </div>
        </div>

        {/* Quick Start Installation Box */}
        <div className="bg-slate-950 text-slate-300 p-6 rounded-3xl text-left mb-10 border border-white/10 font-mono text-xs shadow-md">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 text-slate-400 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="ml-2 text-slate-400 font-sans">{orderDict.quickStartGuide || (locale === "vi" ? "Hướng dẫn cài đặt nhanh" : "Quick Start Setup Guide")}</span>
          </div>
          <div className="space-y-2 text-xs">
            <p className="text-slate-400">{orderDict.quickStep1 || (locale === "vi" ? "# 1. Tải và giải nén file .zip từ kho giao diện" : "# 1. Download and unzip .zip file from vault")}</p>
            <p className="text-emerald-400">$ unzip template-source.zip -d ./my-project</p>
            <p className="text-slate-400 mt-2">{orderDict.quickStep2 || (locale === "vi" ? "# 2. Cài đặt các gói phụ thuộc" : "# 2. Install package dependencies")}</p>
            <p className="text-emerald-400">$ cd my-project &amp;&amp; npm install</p>
            <p className="text-slate-400 mt-2">{orderDict.quickStep3 || (locale === "vi" ? "# 3. Khởi chạy môi trường phát triển local" : "# 3. Start local development server")}</p>
            <p className="text-emerald-400">$ npm run dev</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {hasProductLookupError ? (
            <Link
              href={`/orders/${params.id}/success`}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all text-sm shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw size={16} />
              <span>{locale === "vi" ? "Thử tải lại liên kết" : "Retry Loading Links"}</span>
            </Link>
          ) : isPaid && itemsWithCode.length === 1 && itemsWithCode[0].sourceCodeUrl ? (
            <a
              href={itemsWithCode[0].sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all text-sm shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <Download size={16} />
              <span>{locale === "vi" ? "Tải ngay Source Code (.zip)" : "Download Source Code (.zip)"}</span>
            </a>
          ) : null}
          <Link 
            href="/profile/orders" 
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all text-sm shadow-xs active:scale-95 text-center flex items-center justify-center gap-2"
          >
            <Download size={15} />
            <span>{orderDict.accessVaultButton || orderDict.viewOrdersButton || (locale === "vi" ? "Vào Kho Giao Diện Của Tôi" : "Access My Templates Vault")}</span>
          </Link>
          <Link 
            href="/shop" 
            className="px-6 py-3 bg-white text-slate-700 border border-slate-200/80 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95 text-center shadow-xs"
          >
            {orderDict.continueShoppingButton || (locale === "vi" ? "Khám phá thêm template" : "Browse More Templates")}
          </Link>
        </div>
      </div>
    </div>
  );
}
