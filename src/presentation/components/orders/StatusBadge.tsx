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
  [OrderStatus.COMPLETED]: {
    label: "Đã hoàn thành",
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
