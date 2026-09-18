"use client";

import { useState } from "react";
import { cancelOrderAction } from "@/server/presentation/actions/order";
import { toast } from "@/client/hooks/useToastStore";
import { useRouter } from "next/navigation";
import { useI18n } from "@/client/components/common/I18nContext";

interface CancelOrderButtonProps {
  orderId: string;
}

/**
 * Client button component allowing customers to cancel an active pending order.
 * Triggers cancelOrderAction and provides immediate localized feedback without blocking dialogs.
 *
 * @param props - CancelOrderButtonProps containing orderId.
 * @returns JSX button element.
 */
export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dict } = useI18n();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelOrderAction(orderId);
      if (result.success) {
        toast.success(dict?.orders?.cancelSuccess || "Order cancelled successfully.");
        router.refresh();
      } else {
        toast.error(result.error || dict?.orders?.cancelError || "Unable to cancel order.");
      }
    } catch {
      toast.error(dict?.common?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      type="button"
      className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
    >
      {loading 
        ? (dict?.common?.loading || "Processing...") 
        : (dict?.orders?.cancelOrder || "Cancel Order")}
    </button>
  );
}
