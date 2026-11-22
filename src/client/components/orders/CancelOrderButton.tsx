"use client";

import { useState } from "react";
import { cancelOrderAction } from "@/server/presentation/actions/order";
import { toast } from "@/client/hooks/useToastStore";
import { useRouter } from "next/navigation";
import { useI18n } from "@/client/components/common/I18nContext";
import { Loader2 } from "lucide-react";

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
export function CancelOrderButton({ orderId }: CancelOrderButtonProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dict } = useI18n();

  const handleCancel = async (): Promise<void> => {
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
      className="inline-flex cursor-pointer items-center gap-1.5 border border-error/40 px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-error transition-colors hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{dict?.common?.loading || "Processing..."}</span>
        </>
      ) : (
        <span>{dict?.orders?.cancelOrder || "Cancel Order"}</span>
      )}
    </button>
  );
}
