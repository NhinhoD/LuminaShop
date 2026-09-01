"use client";

import { OrderStatus } from "@/domain/entities/Order";
import { cn } from "@/presentation/utils";
import { useI18n } from "@/presentation/components/common/I18nContext";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { dict } = useI18n();

  const statusConfig = {
    [OrderStatus.PENDING]: {
      label: dict?.orders?.statusPending || "Pending",
      classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    [OrderStatus.COMPLETED]: {
      label: dict?.orders?.statusCompleted || "Completed",
      classes: "bg-green-100 text-green-700 border-green-200",
    },
    [OrderStatus.CANCELLED]: {
      label: dict?.orders?.statusCancelled || "Cancelled",
      classes: "bg-red-100 text-red-700 border-red-200",
    },
  };

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
