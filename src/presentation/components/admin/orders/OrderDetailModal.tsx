"use client";

import { useEffect, useState } from "react";
import { OrderStatus, Order, OrderItem } from "@/domain/entities/Order";
import { getOrderAction, updateOrderStatusAction, approveManualPaymentAction } from "@/presentation/actions/order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { X, Package, MapPin, CreditCard, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    async function loadOrder() {
      const response = await getOrderAction(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
        setNewStatus(response.data.status);
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
        onClose();
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId, onClose]);

  const isValidTransition = (current: OrderStatus, next: OrderStatus) => {
    if (current === next) return true;
    switch (current) {
      case OrderStatus.PENDING:
        return next === OrderStatus.PROCESSING || next === OrderStatus.CANCELLED;
      case OrderStatus.PROCESSING:
        return next === OrderStatus.SHIPPED || next === OrderStatus.CANCELLED;
      case OrderStatus.SHIPPED:
        return next === OrderStatus.DELIVERED;
      case OrderStatus.DELIVERED:
      case OrderStatus.CANCELLED:
        return false;
      default:
        return false;
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus || newStatus === order.status) return;

    if (!isValidTransition(order.status, newStatus as OrderStatus)) {
      toast.error(`Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`);
      return;
    }

    setUpdating(true);
    try {
      const response = await updateOrderStatusAction(orderId, newStatus as OrderStatus);
      if (response.success && response.data) {
        toast.success("Cập nhật trạng thái thành công");
        setOrder(response.data);
      } else {
        toast.error(response.error || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setUpdating(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const response = await approveManualPaymentAction(orderId);
      if (response.success && response.data) {
        toast.success("Đã phê duyệt thanh toán & kích hoạt bản quyền tải về!");
        setOrder(response.data);
        setNewStatus(response.data.status);
      } else {
        toast.error(response.error || "Phê duyệt thất bại");
      }
    } catch {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                <StatusBadge status={order.status} />
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Đặt lúc {formatDate(order.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-6">


                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Thanh toán
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase text-slate-700">
                        {order.paymentMethod === 'cod' ? 'Chuyển khoản VietQR' : order.paymentMethod}
                      </span>
                      <span className={cn(
                        "text-sm font-bold px-3 py-1 rounded-full",
                        order.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {order.paymentStatus === 'paid' ? "Đã thanh toán" : "Chờ thanh toán"}
                      </span>
                    </div>

                    {order.paymentStatus !== 'paid' && (
                      <button
                        onClick={handleApprovePayment}
                        disabled={updating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Phê duyệt Chuyển khoản (Kích hoạt tải code)
                      </button>
                    )}
                  </div>
                </section>

                {order.notes && (
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Ghi chú đơn hàng
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        &ldquo;{order.notes}&rdquo;
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* Status Update */}
              <div className="space-y-6">
                <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Cập nhật trạng thái
                  </h3>
                  <div className="space-y-4">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary"
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status} disabled={!isValidTransition(order.status, status)}>
                          {status.toUpperCase()} {status === order.status ? "(Hiện tại)" : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating || newStatus === order.status}
                      className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                      {updating ? "Đang xử lý..." : "Cập nhật ngay"}
                    </button>
                    {!isValidTransition(order.status, newStatus as OrderStatus) && newStatus !== "" && (
                      <p className="text-[10px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Chuyển trạng thái không hợp lệ
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Items */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Sản phẩm ({order.items?.length})
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
                {order.items?.map((item: OrderItem) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 bg-white">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-300 relative overflow-hidden">
                       {item.productSnapshot?.image_url || item.productSnapshot?.image ? (
                         <Image 
                           src={item.productSnapshot.image_url || item.productSnapshot.image || ""} 
                           alt={item.productTitle || "Product"}
                           fill
                           className="object-cover"
                         />
                       ) : (
                         <Package className="w-6 h-6" />
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.productTitle}</p>
                      {item.productSnapshot?.variantName && (
                        <p className="text-xs text-slate-500">Phân loại: {item.productSnapshot.variantName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatPrice(item.priceAtPurchase)}</p>
                      <p className="text-xs text-slate-500">x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Tổng cộng</p>
                  <p className="text-2xl font-black text-primary">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
