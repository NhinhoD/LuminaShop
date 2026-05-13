import { getOrderAction } from "@/presentation/actions/order";
import { OrderTimeline } from "@/presentation/components/orders/OrderTimeline";
import { OrderRealtimeTracker } from "@/presentation/components/orders/OrderRealtimeTracker";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { CancelOrderButton } from "@/presentation/components/orders/CancelOrderButton";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { BackButton } from "@/presentation/components/common/BackButton";
import { Package, MapPin, CreditCard, Truck, Calendar, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { OrderStatus, OrderItem } from "@/domain/entities/Order";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng | LuminaShop",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getOrderAction(id);

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
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
      <div className="container mx-auto px-4 py-12 text-center">
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <OrderRealtimeTracker orderId={order.id} initialStatus={order.status} />
      
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Chi tiết đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <StatusBadge status={order.status} className="text-sm px-4 py-1" />
            </div>

            <OrderTimeline currentStatus={order.status} />
            
            {order.status === OrderStatus.PENDING && (
              <div className="mt-8 flex justify-end">
                <CancelOrderButton orderId={order.id} />
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-900">Sản phẩm đã mua</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="p-6 flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productSnapshot?.image_url || item.productSnapshot?.image ? (
                      <Image
                        src={item.productSnapshot.image_url || item.productSnapshot.image || ""}
                        alt={item.productTitle || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">
                      {item.productTitle || "Sản phẩm không xác định"}
                    </h3>
                    {item.productSnapshot?.variantName && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phân loại: {item.productSnapshot.variantName}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-1">
                      {formatPrice(item.priceAtPurchase)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50/50 p-6 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-black text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Info */}
        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-900">Địa nhận hàng</h2>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.district}, {order.shippingAddress?.city}
              </p>
              <div className="pt-2 text-sm text-slate-500">
                Số điện thoại: {order.shippingAddress?.phone}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-900">Thanh toán</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium text-slate-900 uppercase">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Trạng thái:</span>
                <span className={cn(
                  "font-bold",
                  order.paymentStatus === 'paid' ? "text-green-600" : "text-yellow-600"
                )}>
                  {order.paymentStatus === 'paid' ? "Đã thanh toán" : "Chờ thanh toán"}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info (Optional/Mock) */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6 rounded-2xl shadow-lg shadow-primary/20 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-6 h-6" />
              <h2 className="font-bold">Dự kiến giao hàng</h2>
            </div>
            <p className="text-primary-foreground/90 text-sm">
              Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
            </p>
            <div className="mt-4 text-2xl font-black">
              2 - 4 Ngày
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
