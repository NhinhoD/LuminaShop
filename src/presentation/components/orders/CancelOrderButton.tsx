"use client";

import { useState } from "react";
import { OrderStatus } from "@/domain/entities/Order";
import { cancelOrderAction } from "@/presentation/actions/order";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    setLoading(true);
    try {
      const result = await cancelOrderAction(orderId);
      if (result.success) {
        toast.success("Đã hủy đơn hàng thành công.");
        router.refresh();
      } else {
        toast.error(result.error || "Không thể hủy đơn hàng.");
      }
    } catch (_e) {
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Hủy đơn hàng"}
    </button>
  );
}
