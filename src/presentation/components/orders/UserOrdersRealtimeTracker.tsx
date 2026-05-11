"use client";

import { useEffect } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { useRouter } from "next/navigation";

interface UserOrdersRealtimeTrackerProps {
  userId: string;
}

export function UserOrdersRealtimeTracker({ userId }: UserOrdersRealtimeTrackerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
