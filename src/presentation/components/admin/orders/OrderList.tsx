"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { OrderStatus, Order } from "@/domain/entities/Order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { Search, Filter, Eye } from "lucide-react";
import { OrderDetailModal } from "@/presentation/components/admin/orders/OrderDetailModal";
import { useDebouncedCallback } from "use-debounce";
import { useLocale } from "@/presentation/hooks/useLocale";
import { useI18n } from "@/presentation/components/common/I18nContext";

interface OrderListProps {
  initialOrders: Order[];
  currentStatus: string;
  currentSearch: string;
  total: number;
}

export function OrderList({ initialOrders, currentStatus, currentSearch, total }: OrderListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { dict } = useI18n();
  const adminDict = (dict?.admin as Record<string, string>) || {};

  const tabs = [
    { id: "all", label: adminDict.tabAll || (locale === "vi" ? "Tất cả" : "All") },
    { id: OrderStatus.PENDING, label: adminDict.tabPending || (locale === "vi" ? "Chờ thanh toán" : "Pending Payment") },
    { id: OrderStatus.COMPLETED, label: adminDict.tabCompleted || (locale === "vi" ? "Đã hoàn thành" : "Completed") },
    { id: OrderStatus.CANCELLED, label: adminDict.tabCancelled || (locale === "vi" ? "Đã hủy" : "Cancelled") },
  ];

  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const updateUrl = (status: string, search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "all") params.set("status", status);
    else params.delete("status");

    if (search) params.set("q", search);
    else params.delete("q");

    params.set("page", "1"); // reset page on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl(currentStatus, term);
  }, 500);

  const handleTabClick = (statusId: string) => {
    updateUrl(statusId, currentSearch);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={adminDict.searchOrdersPlaceholder || (locale === "vi" ? "Tìm kiếm theo mã đơn hàng hoặc khách hàng..." : "Search by order code or customer...")}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {locale === "vi" ? `Đang hiển thị kết quả từ ${total} đơn hàng` : `Showing results from ${total} orders`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                currentStatus === tab.id
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs font-medium">
                <th className="px-6 py-3.5">{adminDict.thOrderId || (locale === "vi" ? "Mã đơn hàng" : "Order ID")}</th>
                <th className="px-6 py-3.5">{adminDict.thCustomer || (locale === "vi" ? "Khách hàng" : "Customer")}</th>
                <th className="px-6 py-3.5">{adminDict.thOrderDate || (locale === "vi" ? "Ngày đặt" : "Order Date")}</th>
                <th className="px-6 py-3.5">{adminDict.thTotalAmount || (locale === "vi" ? "Tổng tiền" : "Total Amount")}</th>
                <th className="px-6 py-3.5">{adminDict.thPayment || (locale === "vi" ? "Thanh toán" : "Payment")}</th>
                <th className="px-6 py-3.5">{adminDict.thOrderStatus || (locale === "vi" ? "Trạng thái" : "Status")}</th>
                <th className="px-6 py-3.5 text-right">{adminDict.thOrderActions || (locale === "vi" ? "Thao tác" : "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {initialOrders.length > 0 ? (
                initialOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {order.shippingAddress?.fullName || (locale === "vi" ? "Khách hàng" : "Customer")}
                      </div>
                      <div className="text-xs text-slate-400 font-normal font-mono">
                        {order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-primary font-mono">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium uppercase text-slate-600 font-mono">
                          {order.paymentMethod}
                        </span>
                        <span className={cn(
                          "text-[11px] font-medium",
                          order.paymentStatus === 'paid' ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {order.paymentStatus === 'paid' 
                            ? (adminDict.paymentPaid || (locale === "vi" ? "Đã thanh toán" : "Paid")) 
                            : (adminDict.paymentPending || (locale === "vi" ? "Chờ thanh toán" : "Pending"))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-xs font-normal">
                    {adminDict.noOrders || (locale === "vi" ? "Không tìm thấy đơn hàng nào" : "No orders found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}
