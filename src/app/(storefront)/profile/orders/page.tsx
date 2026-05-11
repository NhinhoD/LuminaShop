import { getUserOrdersAction } from "@/presentation/actions/order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatPrice, formatDate } from "@/presentation/utils";
import Link from "next/link";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";
import { UserOrdersRealtimeTracker } from "@/presentation/components/orders/UserOrdersRealtimeTracker";
import { OrderItem } from "@/domain/entities/Order";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng | LuminaShop",
  description: "Xem lại các đơn hàng bạn đã đặt tại LuminaShop",
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const response = await getUserOrdersAction();

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {response.error}
        </div>
      </div>
    );
  }

  const orders = response.data || [];

  // DEBUG: Show raw data if empty or query param debug=true
  if (process.env.NODE_ENV === 'development' && orders.length === 0) {

  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {user && <UserOrdersRealtimeTracker userId={user.id} />}
      <div className="flex items-center gap-2 mb-8">
        <Package className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-slate-900 mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-slate-500 mb-8">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/profile/orders/${order.id}`}
              className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-slate-500">
                    Ngày đặt: {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-0.5">Tổng cộng</div>
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Quick Summary of items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                      <div
                        key={idx}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                      >
                         {/* Placeholder for item image if available */}
                         <Package className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {order.items.length} sản phẩm
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
