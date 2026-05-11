"use client";

import { OrderStatus } from "@/domain/entities/Order";
import { cn } from "@/presentation/utils";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig = {
  [OrderStatus.PENDING]: {
    label: "Chờ xác nhận",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  [OrderStatus.PROCESSING]: {
    label: "Đang xử lý",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [OrderStatus.SHIPPED]: {
    label: "Đang giao hàng",
    classes: "bg-purple-100 text-purple-700 border-purple-200",
  },
  [OrderStatus.DELIVERED]: {
    label: "Đã giao hàng",
    classes: "bg-green-100 text-green-700 border-green-200",
  },
  [OrderStatus.CANCELLED]: {
    label: "Đã hủy",
    classes: "bg-red-100 text-red-700 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[OrderStatus.PENDING];

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
