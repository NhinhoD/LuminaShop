import { getOrderAction } from "@/presentation/actions/order";
import { OrderRealtimeTracker } from "@/presentation/components/orders/OrderRealtimeTracker";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { CancelOrderButton } from "@/presentation/components/orders/CancelOrderButton";
import { cn } from "@/presentation/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BackButton } from "@/presentation/components/common/BackButton";
import { Package, MapPin, CreditCard, ShoppingBag, Download, ExternalLink, CheckCircle2, QrCode } from "lucide-react";
import { ImageWithFallback } from "@/presentation/components/common/ImageWithFallback";
import { OrderStatus } from "@/domain/entities/Order";
import { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { makeLanguageRepository, makeProductRepository } from "@/infrastructure/supabase/container";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng | KhoUI",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getOrderAction(id);
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const orderDict = (dict?.orders as Record<string, string>) || {};
  const commonDict = (dict?.common as Record<string, string>) || {};
  const cartDict = (dict?.cart as Record<string, string>) || {};

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 max-w-lg mx-auto">
          <h2 className="text-xl font-bold font-sans mb-2">
            {orderDict.orderNotFound || (locale === "vi" ? "Không tìm thấy đơn hàng" : "Order Not Found")}
          </h2>
          <p className="text-sm text-red-600 mb-6">{response.error}</p>
          <div className="flex justify-center">
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  const order = response.data;
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 max-w-lg mx-auto">
          <h2 className="text-xl font-bold font-sans mb-2">
            {commonDict.error || (locale === "vi" ? "Lỗi dữ liệu" : "Data Error")}
          </h2>
          <p className="text-sm text-red-600 mb-6">{locale === "vi" ? "Không thể tải thông tin chi tiết đơn hàng." : "Unable to load order details."}</p>
          <div className="flex justify-center">
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  // Fetch the actual products for the order items to retrieve their active download/demo URLs
  const productRepository = await makeProductRepository();
  
  const itemsWithCode = await Promise.all(
    order.items.map(async (item) => {
      try {
        const prod = await productRepository.findById(item.productId);
        return {
          ...item,
          sourceCodeUrl: prod?.sourceCodeUrl || "",
          demoUrl: prod?.demoUrl || ""
        };
      } catch {
        return {
          ...item,
          sourceCodeUrl: "",
          demoUrl: ""
        };
      }
    })
  );

  const isOrderPaid = (order.paymentStatus === 'paid' || order.status === OrderStatus.COMPLETED) && order.status !== OrderStatus.CANCELLED;

  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl font-sans">
      <OrderRealtimeTracker orderId={order.id} initialStatus={order.status} />
      
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header & Timeline */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-950 font-sans">
                  {orderDict.orderDetailsTitle || (locale === "vi" ? "Chi tiết đơn hàng" : "Order Details")} #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    {orderDict.onlineOrder || (locale === "vi" ? "Trực tuyến" : "Online")} • {formatDate(order.createdAt, locale)}
                  </span>
                </div>
              </div>
              <StatusBadge status={order.status} className="text-xs px-3 py-1 font-bold rounded-lg" />
            </div>

            {isOrderPaid && (
              <div className="mt-6 bg-green-50 text-green-700 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-bold text-xs md:text-sm">
                  {orderDict.orderPaidSuccess || (locale === "vi" ? "Đơn hàng đã được kích hoạt bản quyền thành công" : "Order has been activated and licensed successfully")}
                </span>
              </div>
            )}
            
            {order.status === OrderStatus.PENDING && (
              <div className="mt-8 flex justify-end">
                <CancelOrderButton orderId={order.id} />
              </div>
            )}
          </div>

          {/* Items & Download Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900 text-sm font-sans">
                {orderDict.ownedSourcePackages || (locale === "vi" ? "Gói mã nguồn sở hữu" : "Owned Source Code Packages")}
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {itemsWithCode.map((item) => (
                <div key={item.id} className="p-6 space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.productSnapshot?.image_url || item.productSnapshot?.image ? (
                        <ImageWithFallback
                          src={item.productSnapshot.image_url || item.productSnapshot.image || ""}
                          alt={getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || "Product"}
                          fill
                          className="object-cover"
                          fallbackElement={<Package className="w-6 h-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || (locale === "vi" ? "Sản phẩm không xác định" : "Unknown Product")}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded font-mono">
                          {orderDict.licenseCode || "SKU:"} {item.productId.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded">
                          {orderDict.lifetimeLicenseBadge || (locale === "vi" ? "CẤP PHÉP TRỌN ĐỜI" : "LIFETIME LICENSE")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-900 text-sm font-mono">
                      {formatCurrency(Number(item.priceAtPurchase), locale)}
                    </div>
                  </div>

                  {/* HIGH-CONTRAST DIGITAL DOWNLOAD DRAWER */}
                  {isOrderPaid ? (
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                      {item.sourceCodeUrl ? (
                        <a
                          href={item.sourceCodeUrl}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all text-xs shadow-xs active:scale-98"
                        >
                          <Download size={14} />
                          <span>{orderDict.downloadSourceCode || (locale === "vi" ? "Tải source code (.zip)" : "Download Source Code (.zip)")}</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-medium text-xs cursor-not-allowed border border-slate-200/80"
                        >
                          <Download size={14} />
                          <span>{orderDict.preparingDownload || (locale === "vi" ? "Đang chuẩn bị file tải lên..." : "Preparing upload file...")}</span>
                        </button>
                      )}
                      
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-medium border border-slate-200/80 transition-all text-xs"
                        >
                          <ExternalLink size={14} />
                          <span>{orderDict.liveDemoBtn || (locale === "vi" ? "Xem Demo trực tiếp" : "Live Demo")}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 text-xs font-normal text-amber-800 flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>
                        {orderDict.transferVerifying || (locale === "vi" ? "Giao dịch chuyển khoản đang được xác nhận. Link tải code sẽ tự động hiển thị tại đây khi hoàn tất." : "Bank transfer verification in progress. Download links will appear here immediately once verified.")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-50/50 p-6 space-y-3">
              <div className="flex justify-between text-xs font-normal text-slate-500">
                <span>{cartDict.subtotal || (locale === "vi" ? "Tạm tính" : "Subtotal")}</span>
                <span className="text-slate-900 font-medium font-mono">{formatCurrency(order.totalAmount, locale)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200/80">
                <span className="font-semibold text-slate-900 text-sm">{orderDict.total || (locale === "vi" ? "Tổng cộng" : "Total Amount")}</span>
                <span className="text-xl font-bold text-primary font-mono">
                  {formatCurrency(order.totalAmount, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & License Info */}
        <div className="space-y-6">
          
          {/* Digital Email Delivery */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900 text-sm font-sans">
                {orderDict.accountDeliverInfo || (locale === "vi" ? "Thông tin tài khoản nhận mã nguồn" : "Source Code Recipient Account")}
              </h2>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-slate-900 text-sm">{order.shippingAddress?.fullName}</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 font-normal block mb-0.5 text-xs">
                  {orderDict.deployEnvironment || (locale === "vi" ? "Môi trường nhận code (Email)" : "Delivery Destination (Email)")}
                </span>
                <span className="font-medium text-slate-800 break-all font-mono">{order.shippingAddress?.street}</span>
              </div>
              <div className="text-xs text-slate-400 font-normal font-mono">
                {orderDict.contactSupportChannel || (locale === "vi" ? "Kênh liên hệ hỗ trợ:" : "Support Contact Channel:")} {order.shippingAddress?.phone}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900 text-sm font-sans">
                {orderDict.paymentMethod || (locale === "vi" ? "Thanh toán" : "Payment Details")}
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-normal">
                  {orderDict.paymentMethod || "Method"}:
                </span>
                <span className="font-medium text-slate-900 font-mono uppercase">
                  {order.paymentMethod === 'cod' ? 'Manual VietQR' : order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-normal">
                  {orderDict.paymentStatusLabel || (locale === "vi" ? "Trạng thái:" : "Status:")}
                </span>
                <span className={cn(
                  "font-medium",
                  order.paymentStatus === 'paid' ? "text-emerald-600" : "text-amber-600"
                )}>
                  {order.paymentStatus === 'paid' 
                    ? (orderDict.paymentPaid || (locale === "vi" ? "Đã xác nhận" : "Verified & Paid"))
                    : (orderDict.paymentPending || (locale === "vi" ? "Đang chờ duyệt" : "Awaiting Verification"))}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Bank Transfer details if not paid yet */}
          {!isOrderPaid && (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900 text-sm font-sans">
                  {orderDict.bankTransferGuide || (locale === "vi" ? "Hướng dẫn chuyển khoản" : "Bank Transfer Instructions")}
                </h3>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 space-y-2.5 leading-relaxed">
                <div>
                  <span className="font-normal text-slate-400 block text-xs">{orderDict.bankName || "Bank"}</span>
                  <span className="font-medium text-slate-900 text-xs">MB BANK (Ngân hàng Quân Đội)</span>
                </div>
                <div>
                  <span className="font-normal text-slate-400 block text-xs">{orderDict.bankAccountNo || "Account No"}</span>
                  <span className="font-medium text-slate-900 text-xs font-mono">999988886666</span>
                </div>
                <div>
                  <span className="font-normal text-slate-400 block text-xs">{orderDict.bankAccountHolder || "Account Holder"}</span>
                  <span className="font-medium text-slate-900 text-xs">PHUNG XUAN DUONG</span>
                </div>
                <div>
                  <span className="font-normal text-slate-400 block text-xs">{orderDict.bankContent || "Transfer Memo"}</span>
                  <span className="font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded text-xs inline-block mt-0.5 font-mono">KHOUI {order.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Digital Handover Shield */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl shadow-xs text-white">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-semibold text-sm font-sans">
                {orderDict.sourceDeliveryTitle || (locale === "vi" ? "Bàn giao mã nguồn" : "Source Code Handover")}
              </h2>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed font-normal">
              {isOrderPaid 
                ? (orderDict.sourceDeliveryPaid || (locale === "vi" ? "Bản quyền đã kích hoạt! Hãy nhấn vào nút 'Tải về Source Code' bên dưới sản phẩm để tải file mã nguồn dạng .zip." : "License active! Click 'Download Source Code' below each item to retrieve the .zip package."))
                : (orderDict.sourceDeliveryPending || (locale === "vi" ? "Đơn hàng đang chờ xác nhận giao dịch chuyển khoản. Vui lòng hoàn thành chuyển khoản để kích hoạt link tải tự động." : "Order is awaiting bank payment confirmation. Please complete the transfer to unlock instant downloads."))
              }
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
