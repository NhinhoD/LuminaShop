import { getOrderAction } from "@/presentation/actions/order";
import { OrderRealtimeTracker } from "@/presentation/components/orders/OrderRealtimeTracker";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { CancelOrderButton } from "@/presentation/components/orders/CancelOrderButton";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { BackButton } from "@/presentation/components/common/BackButton";
import { Package, MapPin, CreditCard, ShoppingBag, Download, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "@/presentation/components/common/ImageWithFallback";
import { OrderStatus } from "@/domain/entities/Order";
import { Metadata } from "next";
import { getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";

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

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center font-manrope">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto">
          <h2 className="text-lg font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p>{response.error}</p>
          <div className="mt-6">
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  const order = response.data;
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center font-manrope">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto">
          <h2 className="text-lg font-bold mb-2">Lỗi dữ liệu</h2>
          <p>Không thể tải thông tin chi tiết đơn hàng.</p>
          <div className="mt-6">
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  // Fetch the actual products for the order items to retrieve their active download/demo URLs
  const { makeProductRepository } = await import("@/infrastructure/supabase/container");
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

  const isOrderPaid = order.paymentStatus === 'paid' || order.status === OrderStatus.DELIVERED;

  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl font-manrope">
      <OrderRealtimeTracker orderId={order.id} initialStatus={order.status} />
      
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header & Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 font-playfair">
                  Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    Trực tuyến • {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <StatusBadge status={order.status} className="text-xs px-3 py-1 font-bold rounded-lg" />
            </div>

            {isOrderPaid && (
              <div className="mt-6 bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-1 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-bold text-sm">Đơn hàng đã được kích hoạt bản quyền thành công</span>
              </div>
            )}
            
            {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
              <div className="mt-8 flex justify-end">
                <CancelOrderButton orderId={order.id} />
              </div>
            )}
          </div>

          {/* Items & Download Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0051d5]" />
              <h2 className="font-extrabold text-slate-900 text-sm">Gói mã nguồn sở hữu</h2>
            </div>
            
            <div className="divide-y divide-slate-50">
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
                          fallbackElement={<Package className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-800 text-[14px] truncate">
                        {getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || "Sản phẩm không xác định"}
                      </h3>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[8px] bg-slate-100 text-slate-400 font-extrabold px-1.5 py-0.5 rounded">
                          MÃ SỐ: {item.productId.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="text-[8px] bg-blue-50 text-[#0051d5] font-extrabold px-1.5 py-0.5 rounded">
                          CẤP PHÉP TRỌN ĐỜI
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-black text-slate-900 text-sm">
                      {formatPrice(Number(item.priceAtPurchase))}
                    </div>
                  </div>

                  {/* HIGH-CONTRAST DIGITAL DOWNLOAD DRAWER */}
                  {isOrderPaid ? (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      {item.sourceCodeUrl ? (
                        <a
                          href={item.sourceCodeUrl}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0051d5] hover:bg-[#0041ac] text-white px-5 py-3 rounded-xl font-bold transition-all text-xs shadow-md shadow-blue-500/10 active:scale-98 animate-[pulse_2s_infinite]"
                        >
                          <Download size={14} />
                          <span>Tải về Source Code (.zip)</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-5 py-3 rounded-xl font-bold text-xs cursor-not-allowed border border-slate-200"
                        >
                          <Download size={14} />
                          <span>Đang chuẩn bị file tải lên...</span>
                        </button>
                      )}
                      
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold border border-slate-200 transition-all text-xs"
                        >
                          <ExternalLink size={14} />
                          <span>Xem Demo trực tiếp</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-[11px] font-bold text-amber-700 flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                      <span>Giao dịch chuyển khoản đang được xác nhận. Link tải code sẽ tự động hiển thị tại đây khi hoàn tất.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-50/50 p-6 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Tạm tính</span>
                <span className="text-slate-800">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">Tổng cộng</span>
                <span className="text-2xl font-black text-[#0051d5] font-playfair">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & License Info */}
        <div className="space-y-6">
          
          {/* Digital Email Delivery */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#0051d5]" />
              <h2 className="font-extrabold text-slate-900 text-sm">Thông tin tài khoản nhận mã nguồn</h2>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-slate-800 text-[13px]">{order.shippingAddress?.fullName}</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Môi trường triển khai</span>
                <span className="font-extrabold text-slate-800 break-all">{order.shippingAddress?.street}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-bold">
                Kênh liên hệ hỗ trợ: {order.shippingAddress?.phone}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#0051d5]" />
              <h2 className="font-extrabold text-slate-900 text-sm">Thanh toán</h2>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Phương thức:</span>
                <span className="font-extrabold text-slate-800 uppercase">
                  {order.paymentMethod === 'cod' ? 'Manual VietQR' : order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Trạng thái:</span>
                <span className={cn(
                  "font-black uppercase tracking-wider",
                  order.paymentStatus === 'paid' ? "text-green-600" : "text-amber-500"
                )}>
                  {order.paymentStatus === 'paid' ? "Đã xác nhận" : "Đang chờ duyệt"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Bank Transfer details if not paid yet */}
          {!isOrderPaid && (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">Hướng dẫn chuyển khoản</h3>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 space-y-2.5 leading-relaxed">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest block">Ngân hàng</span>
                  <span className="font-extrabold text-slate-800 text-xs">MB BANK (Ngân hàng Quân Đội)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest block">Số tài khoản</span>
                  <span className="font-extrabold text-slate-800 text-xs">999988886666</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest block">Chủ tài khoản</span>
                  <span className="font-extrabold text-slate-800 text-xs">PHUNG XUAN DUONG</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest block">Nội dung CK</span>
                  <span className="font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-xs">LUMINA {order.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Digital Handover Shield */}
          <div className="bg-gradient-to-br from-[#0051d5] to-[#0041ac] p-6 rounded-3xl shadow-lg shadow-blue-500/10 text-white">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="font-extrabold text-sm">Bàn giao mã nguồn</h2>
            </div>
            <p className="text-blue-100 text-[11px] leading-relaxed">
              {isOrderPaid 
                ? "Bản quyền đã kích hoạt! Hãy nhấn vào nút 'Tải về Source Code' bên dưới sản phẩm để tải file mã nguồn dạng .zip." 
                : "Đơn hàng đang chờ xác nhận giao dịch chuyển khoản. Vui lòng hoàn thành chuyển khoản để kích hoạt link tải tự động."
              }
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple placeholder Lucide QrCode icon since QrCode isn't in main import or for safety
function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16V21H16" />
      <path d="M21 9v2h-2" />
      <path d="M9 21h2v-2" />
      <path d="M14 14h.01" />
      <path d="M18 18h.01" />
    </svg>
  );
}
