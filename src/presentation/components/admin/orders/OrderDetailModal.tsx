"use client";

import React, { useEffect, useState } from "react";
import { Order, OrderItem } from "@/domain/entities/Order";
import { getOrderAction, approveManualPaymentAction } from "@/presentation/actions/order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatPrice, formatDate, cn } from "@/presentation/utils";
import { X, Package, CreditCard, CheckCircle, FileText } from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";
import { ImageWithFallback } from "@/presentation/components/common/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalizedText } from "@/presentation/utils/locale";

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps): React.ReactElement | null {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const response = await getOrderAction(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
        onClose();
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId, onClose]);

  const handleApprovePayment = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const response = await approveManualPaymentAction(orderId);
      if (response.success && response.data) {
        toast.success("Phê duyệt thành công!", "Đã kích hoạt bản quyền tải về cho khách hàng.");
        setOrder(response.data);
      } else {
        toast.error("Phê duyệt thất bại", response.error || "Vui lòng thử lại sau.");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-manrope">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
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
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-playfair">
                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                <StatusBadge status={order.status} />
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Đặt lúc {formatDate(order.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Thanh toán
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-700">
                        {order.paymentMethod === 'cod' ? 'Chuyển khoản VietQR' : order.paymentMethod}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full",
                        order.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {order.paymentStatus === 'paid' ? "Đã thanh toán" : "Chờ thanh toán"}
                      </span>
                    </div>

                    {order.paymentStatus !== 'paid' && (
                      <button
                        onClick={handleApprovePayment}
                        disabled={updating}
                        type="button"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-98"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Phê duyệt Chuyển khoản (Kích hoạt tải code)
                      </button>
                    )}
                  </div>
                </section>

                {order.notes && (
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Ghi chú đơn hàng
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        &ldquo;{order.notes}&rdquo;
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Items */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Sản phẩm ({order.items?.length})
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
                {order.items?.map((item: OrderItem) => (
                   <div key={item.id} className="p-4 flex items-center gap-4 bg-white">
                    <div className="relative w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-300 overflow-hidden">
                       {item.productSnapshot?.image_url || item.productSnapshot?.image ? (
                         <ImageWithFallback 
                           src={item.productSnapshot.image_url || item.productSnapshot.image || ""} 
                           alt={getLocalizedText(item.productTitle as unknown as Record<string, string>, 'vi') || "Product"}
                           fill
                           className="object-cover"
                           fallbackElement={<Package className="w-6 h-6" />}
                         />
                       ) : (
                         <Package className="w-6 h-6" />
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{getLocalizedText(item.productTitle as unknown as Record<string, string>, 'vi')}</p>
                      {item.productSnapshot?.variantName && (
                        <p className="text-[10px] text-slate-500">Phân loại: {item.productSnapshot.variantName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{formatPrice(item.priceAtPurchase)}</p>
                      <p className="text-[10px] text-slate-500">x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng cộng</p>
                  <p className="text-xl font-black text-[#0051d5] font-playfair">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
