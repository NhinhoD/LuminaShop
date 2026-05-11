"use client";

import { useState, useMemo } from "react";
import { OrderStatus, Order } from "@/domain/entities/Order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { Search, Filter, MoreVertical, Eye } from "lucide-react";
import { OrderDetailModal } from "@/presentation/components/admin/orders/OrderDetailModal";

interface OrderListProps {
  initialOrders: Order[];
}

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: OrderStatus.PENDING, label: "Chờ xác nhận" },
  { id: OrderStatus.PROCESSING, label: "Đang xử lý" },
  { id: OrderStatus.SHIPPED, label: "Đang giao" },
  { id: OrderStatus.DELIVERED, label: "Đã giao" },
  { id: OrderStatus.CANCELLED, label: "Đã hủy" },
];

export function OrderList({ initialOrders }: OrderListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const matchesTab = activeTab === "all" || order.status === activeTab;
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [initialOrders, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc khách hàng..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Hiển thị {filteredOrders.length} đơn hàng</span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-transparent text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Mã đơn hàng</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Thanh toán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {order.shippingAddress?.fullName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase text-slate-500">
                          {order.paymentMethod}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          order.paymentStatus === 'paid' ? "text-green-600" : "text-yellow-600"
                        )}>
                          {order.paymentStatus === 'paid' ? "Đã trả" : "Chờ trả"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào
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
