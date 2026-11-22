"use client";

import { OrderStatus } from "@/shared/types/order";
import { cn } from "@/shared/utils";
import { useI18n } from "@/client/components/common/I18nContext";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Square spec-sheet status chip for order states.
 *
 * @param props - Order status and optional class overrides.
 * @returns Status badge.
 */
export function StatusBadge({ status, className }: StatusBadgeProps): React.JSX.Element {
  const { dict } = useI18n();

  const statusConfig = {
    [OrderStatus.PENDING]: {
      label: dict?.orders?.statusPending || "Pending",
      classes: "bg-primary/5 text-primary border-primary/30",
    },
    [OrderStatus.COMPLETED]: {
      label: dict?.orders?.statusCompleted || "Completed",
      classes: "bg-success/5 text-success border-success/30",
    },
    [OrderStatus.CANCELLED]: {
      label: dict?.orders?.statusCancelled || "Cancelled",
      classes: "bg-error/5 text-error border-error/30",
    },
  };

  const config = statusConfig[status] || statusConfig[OrderStatus.PENDING];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em]",
        config.classes,
        className
      )}
    >
      <span className="h-1 w-1 bg-current" />
      {config.label}
    </span>
  );
}
