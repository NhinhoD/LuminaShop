"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { OrderStatus } from "@/domain/entities/Order";
import { useRouter } from "next/navigation";

interface OrderRealtimeTrackerProps {
  orderId: string;
  initialStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

export function OrderRealtimeTracker({ orderId, initialStatus, onStatusChange }: OrderRealtimeTrackerProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as OrderStatus;
          if (newStatus && newStatus !== currentStatus) {
            setCurrentStatus(newStatus);
            onStatusChange?.(newStatus);
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentStatus, onStatusChange, router]);

  return null; // This is a logic-only component
}
